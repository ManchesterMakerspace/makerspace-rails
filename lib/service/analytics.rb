require "csv"

module Service
  module Analytics
    module Members
      def self.query_not_landlord(base = Mongoid::Criteria.new(Member))
        base.where(:firstname.ne => "Landlord", :lastname.ne => "Fob")
      end

      # All members current and in good standing
      def self.query_total_members(base = query_good_standing_members)
        base.where(:expirationTime.gte => (Time.now.to_i * 1000))
      end

      # Members that signed up within the timeframe
      def self.query_new_members(timeframe = 1.month, base = query_good_standing_members)
        base.where(:startDate.gte => (Time.now - timeframe))
      end

      # Members that are in good standing, do not have an expiration date, and have invoices pending settlement
      def self.query_membership_not_started(base = query_no_expiration)
        base.where({ :id.in => ::Service::Analytics::Invoices.query_settlement_pending.pluck(:member_id).uniq })
      end

      # Members that are in good standing, do not have an expiration date, and have no invoices pending settlement
      def self.query_no_membership(base = query_no_expiration)
        base.where({ :id.nin => ::Service::Analytics::Invoices.query_settlement_pending.pluck(:member_id).uniq })
      end
      
      # Members that do not have an expiration, regardless of whether they are waiting for orientation or haven't purchased anything
      def self.query_no_expiration(base = query_good_standing_members)
        base.in(expirationTime: ["", nil])
      end

      # Members that need to sign a member contract
      def self.query_no_member_contract(base = query_total_members)
        base.where(member_contract_signed_date: nil)
      end

      def self.query_paypal_members(base = query_total_members)
        base.where(subscription: true, :subscription_id => nil)
      end

      def self.query_braintree_members(base = query_total_members) # Controller
        base.where(
          :$or => [
            { :subscription_id.ne => nil },
            {  subscription: true }
          ])
      end

      def self.query_good_standing_members(base = query_not_landlord)
        base.where(status: "activeMember")
      end

      def self.get_membership_lengths(base = query_not_landlord.where(:expirationTime.ne => nil))
        base.pluck(:startDate, :expirationTime).to_a.map do |member|
          startDate, expirationTime = member
          date1 = startDate
          date2 = Time.at(expirationTime.to_i/1000)
          [startDate.strftime("%m/%d/%Y"), ((date2.year * 12 + date2.month) - (date1.year * 12 + date1.month))]
        end
      end

      # Length in months
      def self.get_average_membership_length(base = query_not_landlord.where(:expirationTime.ne => nil))
        total_membership_length = base.pluck(:startDate, :expirationTime).to_a.reduce(0.0) do |memo, member|
          startDate, expirationTime = member
          date1 = startDate
          date2 = Time.at(expirationTime.to_i/1000)
          memo + ((date2.year * 12 + date2.month) - (date1.year * 12 + date1.month))
        end

        total_membership_length/base.size
      end

      def self.get_median_membership_length(base = query_not_landlord.where(:expirationTime.ne => nil))
        membership_lengths = base.pluck(:startDate, :expirationTime).to_a.map do |member|
          startDate, expirationTime = member
          date1 = startDate
          date2 = Time.at(expirationTime.to_i/1000)
          ((date2.year * 12 + date2.month) - (date1.year * 12 + date1.month))
        end

        sorted = membership_lengths.sort
        len = sorted.length
        (sorted[(len - 1) / 2] + sorted[len / 2]) / 2.0
      end

      def self.get_membership_per_month(base = query_not_landlord, start_date = Date.parse("08/01/2016"))
        # Iterate for each month between start date and now
        # Query members that had started by that time and not expired
        months = (start_date..Date.today).map{|d| Date.new(d.year, d.month)}.uniq
        months.map { |month| [month, base.where(:startDate.lte => month, :expirationTime.gte => (month.to_time.to_i * 1000)).count] }
      end
    end

    module Rentals
      def self.query_no_rental_contract(base = query_total_rentals) # Member review
        base.where(contract_on_file: false)
      end

      def self.query_expiring_rentals(base = query_total_rentals) # not used
        base.where(:expiration.lte => ((Time.now + 2.weeks).to_i * 1000))
      end

      def self.query_unsubscribed_rentals(base = query_total_rentals)
        base.where(:subscription_id => nil)
      end

      def self.query_subscribed_rentals(base = query_total_rentals) #not used
        base.where(:subscription_id.ne => nil)
      end

      def self.query_total_rentals(base = Mongoid::Criteria.new(Rental))
        base.where(:expiration.gte => (Time.now.to_i * 1000), :member_id.in => ::Service::Analytics::Members.query_good_standing_members.pluck(:id))
      end
    end

    module Invoices
      def self.query_created(timeframe = 1.month, base = Mongoid::Criteria.new(Invoice)) #Invoice review
        base.where(:created_at.gt => Time.now - timeframe)
      end

      def self.query_earned(timeframe = 1.month, base = Mongoid::Criteria.new(Invoice)) #invoice review
        base.where(:settled_at.gt => Time.now - timeframe)
      end

      def self.query_past_due(base = Mongoid::Criteria.new(Invoice)) #invoice review and controller
        base.where(:due_date.lt => Time.now, settled_at: nil, transaction_id: nil, :member_id.in => ::Service::Analytics::Members.query_total_members.pluck(:id))
      end

      def self.query_refunds_pending(base = Mongoid::Criteria.new(Invoice)) #invoice review and controller
        base.where(refunded: false, :refunded_requested.ne => nil)
      end

      def self.query_settlement_pending(base = Mongoid::Criteria.new(Invoice)) # invoice review
        base.where(settled_at: nil, :transaction_id.ne => nil)
      end

      def self.query_all_settled(base = Mongoid::Criteria.new(Invoice))
        base.where(:settled_at.ne => nil)
      end

      def self.get_rentals(base = query_all_settled)
        rental_keys = {
          "Shelf": ["Rental-Monthly-Small-back-shop-shelf-subscription", "rental-quarterly-recurring-back-shop-shelf-subscription", "rental-monthly-non-recurring-back-shop-shelf"],
          "Locker": ["rental-quarterly-recurring-locker-subscription"],
          "Plot": ["rental-monthly-2-2-plot", "rental-monthly-4-4-plot", "rental-monthly-5-10-plot", "rental-monthly-5-5-plot", "rental-monthly-5-7-plot", "rental-monthly-6-6-plot"]
        }

        rental_keys.map do |name, key|
          [name, base.where(:plan_id.in => key)]
        end.to_h
      end

      def self.get_rental_count(base = query_all_settled)
        get_rentals.map do |name, query|
          [name, query.size]
        end.to_h
      end

      def self.get_rental_dollars(base = query_all_settled)
        get_rentals.map do |name, query|
          [name, query.pluck(:amount).reduce(0.0) { |sum, amt| sum + (amt || 0) }]
        end.to_h
      end

      def self.get_membership_subscriptions(base = query_all_settled)
        subscription_keys = {
          "Monthly": ["membership-one-month-recurring"],
          "Quarterly": ["membership-three-month-recurring-covid", "membership-three-month-recurring"],
          "Semi Annually": ["membership-six-month-recurring"],
          "Yearly": ["membership-twelve-month-recurring"],
        }

        discount_keys = {
          "Monthly": ["monthly_membership_sso", "old_membership_sso"],
          "Quarterly": ["quarterly_membership_sso", "quarterly_founder_membership"],
          "Semi Annually": ["biannual_membership_sso"],
          "Yearly": ["annual_membership_sso"],
        }

        all_subscriptions = []

        subscription_keys.map do |name, key|
          all_by_key = base.where(:plan_id.in => key)
          key_with_discount = all_by_key.where(:discount_id.ne => nil)
          key_no_discount = all_by_key.reject { |inv| key_with_discount.include?(inv) }

          all_subscriptions.push(
            [name, key_no_discount]
          )
          all_subscriptions.push(
            ["#{name} (Discounted)", key_with_discount]
          )
        end
        
        all_subscriptions.to_h
      end

      def self.get_membership_subscription_count(base = query_all_settled)
        get_membership_subscriptions.map do |name, query|
          [name, query.size]
        end.to_h
      end

      def self.get_membership_subscription_dollars(base = query_all_settled)
        get_membership_subscriptions.map do |name, query|
          [name, query.pluck(:amount).reduce(0.0) { |sum, amt| sum + (amt || 0) }]
        end.to_h
      end

      def self.csv_by_date(query, csv_path)
        data = query.map do |name, q|
          [name, *q.pluck(:settled_at).map { |d| d.strftime("%m/%d/%Y") }]
        end
        query_to_csv(data, csv_path)
      end

      def self.query_to_csv(data, csv_path)
        max_row_size = data.max { |r1, r2| r1.size <=> r2.size }.size
        data.each { |r| r[max_row_size - 1] ||=nil }
        CSV.open(csv_path, "wb") do |csv|
          data.transpose.each { |r| csv << r }
        end
      end
    end

    module Payments
      def self.not_categorized 
        all_found = Service::Analytics::Payments.get_membership_subscriptions.values.map { |q| q.pluck(:id) }.flatten
        all_found = all_found.concat(Service::Analytics::Payments.get_rentals.values.map { |q| q.pluck(:id) }.flatten)
        all_found = all_found.concat(Service::Analytics::Payments.get_donations.values.map { |q| q.pluck(:id) }.flatten)

        Payment.where(:id.nin => all_found).where(:product.ne => " ").pluck(:product)
      end

      def self.query_completed(base = Mongoid::Criteria.new(Payment))
        base.where(:status => "Completed")
      end

      def self.get_donations(base = query_completed)
        donation_keys = {
          "5": ["5-donation"],
          "10": ["10-donation"],
          "20": ["20-donation"],
          "100": ["100-donation"],
          "Custom": ["custom-donation"]
        }
        donation_keys.map do |name, key|
          [name, base.where(:product => Regexp.new("(#{key.join("|")})$", "i"))]
        end.to_h
      end

      def self.get_donation_count(base = query_completed)
        get_donations.map do |name, query|
          [name, query.size]
        end.to_h
      end

      def self.get_donation_dollars(base = query_completed)
        get_donations.map do |name, query|
          [name, query.pluck(:amount).reduce(0.0) { |sum, amt| sum + (amt || 0) }]
        end.to_h
      end

      def self.get_membership_subscriptions(base = query_completed)
        subscription_keys = {
          "Single Month": ["1-month Individual Membership 1mo-Stnd"],
          "Monthly": ["1-month Subscription", "Subscription Membership Sub-Stnd-Membership", "1-month Subscription Sub-Stnd-Membership", "1mo-Sub"],
          "Monthly (Discounted)": ["1-month Discount Subscription", "1mo-Sub-SMS", "1mo-Stnd-SMS"],
          "Quarterly": ["3-month Subscription", "3mo-Sub"],
          "Quarterly (Discounted)": ["3-month Discount Subscription", "3mo-Sub-SMS"],
          "Semi Annually": ["6mo-Sub"],
          "Semi Annually (Discounted)": ["6mo-Sub-SMS"],
          "Yearly": ["12mo-Sub"],
          "Yearly (Discounted)": ["12mo-Sub-SMS"],
        }

        subscription_keys.map do |name, key|
          [name, base.where(:product => Regexp.new("(#{key.join("|")})$", "i"))]
        end.to_h
      end

      def self.get_membership_subscription_count(base = query_completed)
        get_membership_subscriptions.map do |name, query|
          [name, query.size]
        end.to_h
      end

      def self.get_membership_subscription_dollars(base = query_completed)
        get_membership_subscriptions.map do |name, query|
          [name, query.pluck(:amount).reduce(0.0) { |sum, amt| sum + (amt || 0) }]
        end.to_h
      end

      def self.get_rentals(base = query_completed)
        rental_keys = {
          "Plot": "Plot",
          "Shelf": "Shelf",
          "Locker": "Locker"
        }

        rental_keys.map do |name, key|
          [name, base.where(:product => Regexp.new("^#{key}", "i"))]
        end.to_h
      end

      def self.get_rental_count(base = query_completed)
        get_rentals.map do |name, query|
          [name, query.size]
        end.to_h
      end

      def self.get_rental_dollars(base = query_completed)
        get_rentals.map do |name, query|
          [name, query.pluck(:amount).reduce(0.0) { |sum, amt| sum + (amt || 0) }]
        end.to_h
      end

      def self.csv_by_date(query, csv_path)
        data = query.map do |name, q|
          [name, *q.pluck(:payment_date).map { |d| (d.kind_of?(Time) ? d : Time.parse(d.sub(/(\d+:)+\d+\s/, ""))).strftime("%m/%d/%Y") }]
        end
        query_to_csv(data, csv_path)
      end

      def self.query_to_csv(data, csv_path)
        max_row_size = data.max { |r1, r2| r1.size <=> r2.size }.size
        data.each { |r| r[max_row_size - 1] ||=nil }
        CSV.open(csv_path, "wb") do |csv|
          data.transpose.each { |r| csv << r }
        end
      end
    end
  end
end