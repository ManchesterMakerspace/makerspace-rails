module Service
  module Analytics
    module Members
      def self.query_no_expiration
        query_active_members.in(expirationTime: ["", nil])
      end

      def self.query_no_member_contract
        query_active_members.where(:expirationTime.gte => (Time.now.to_i * 1000), memberContractOnFile: false)
      end

      def self.query_no_fobs
        query_active_members.not_in(id: Card.pluck(:member_id))
      end

      def self.query_total_members
        query_active_members.where(:expirationTime.gte => (Time.now.to_i * 1000))
      end

      def self.query_new_members(timeframe = 1.month)
        query_active_members.where(:startDate.gte => (Time.now - timeframe))
      end

      def self.query_expiring_members
        query_active_members.where(:expirationTime.gte => (Time.now.to_i * 1000), :expirationTime.lte => ((Time.now + 2.weeks).to_i * 1000))
      end

      def self.query_subscribed_members
        query_active_members.where(:expirationTime.gte => (Time.now.to_i * 1000),
          :$or => [
            { :subscription_id.nin => [nil, ""] },
            {  subscription: true }
          ])
      end

      def self.query_active_members
        Member.where(status: "activeMember")
      end
    end

    module Rentals
      def self.query_no_rental_contract
        Rental.where(:expiration.gte => (Time.now.to_i * 1000), contract_on_file: false)
      end

      def self.query_total_rentals
        Rental.where(:expiration.gte => (Time.now.to_i * 1000))
      end

      def self.query_expiring_rentals
        Rental.where(:expiration.gte => (Time.now.to_i * 1000), :expiration.lte => ((Time.now + 2.weeks).to_i * 1000))
      end

      def self.query_subscribed_rentals
        Rental.where(:expiration.gte => (Time.now.to_i * 1000), :subscription_id.nin => [nil, ""])
      end
    end

    module Invoices
      def self.query_created(timeframe = 1.month)
        Invoice.where(:created_at.gt => Time.now - timeframe)
      end

      def self.query_earned(timeframe = 1.month)
        Invoice.where(:settled_at.gt => Time.now - timeframe)
      end

      def self.query_past_due
        Invoice.where(:due_date.lt => Time.now, settled_at: nil, transaction_id: nil, :member_id.in => ::Service::Analytics::Members.query_total_members.pluck(:id))
      end

      def self.query_refunds_pending
        Invoice.where(refunded: false, :refunded_requested.ne => nil)
      end

      def self.query_settlement_pending
        Invoice.where(settled_at: nil, :transaction_id.ne => nil)
      end
    end
  end
end