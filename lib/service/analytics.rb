module Service
  module Analytics
    module Members
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
        base.where(memberContractOnFile: false)
      end

      def self.query_paypal_members(base = query_total_members)
        base.where(subscription: true, :subscription_id.nin => [nil, ""])
      end

      def self.query_braintree_members(base = query_total_members) # Controller
        base.where(
          :$or => [
            { :subscription_id.nin => [nil, ""] },
            {  subscription: true }
          ])
      end

      def self.query_good_standing_members(base = Mongoid::Criteria.new(Member))
        base.where(status: "activeMember")
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
        base.where(:subscription_id.in => [nil, ""])
      end

      def self.query_subscribed_rentals(base = query_total_rentals) #not used
        base.where(:subscription_id.nin => [nil, ""])
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
    end
  end
end