module Service
  module Analytics
    module Members
      def self.query_no_expiration
        Member.in(expirationTime: ["", nil])
      end

      def self.query_no_member_contract
        Member.where(:expirationTime.gte => (Time.now.to_i * 1000), memberContractOnFile: false)
      end

      def self.query_no_fobs
        Member.not_in(id: Card.pluck(:member_id))
      end

      def self.query_total_members
        Member.where(:expirationTime.gte => (Time.now.to_i * 1000))
      end

      def self.query_new_members(timeframe = 1.month)
        Member.where(:startDate.gte => (Time.now - timeframe))
      end

      def self.query_expiring_members
        Member.where(:expirationTime.gte => (Time.now.to_i * 1000), :expirationTime.lte => ((Time.now + 2.weeks).to_i * 1000))
      end

      def self.query_subscribed_members
        Member.where(:expirationTime.gte => (Time.now.to_i * 1000),
          :$or => [
            { :subscription_id.nin => [nil, ""] },
            {  subscription: true }
          ])
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
        Invoice.where(:due_date.lt => Time.now, settled_at: nil, transaction_id: nil)
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