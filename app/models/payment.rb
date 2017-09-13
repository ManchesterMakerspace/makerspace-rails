class Payment
  include Mongoid::Document
  include ActiveModel::Serializers::JSON
  # store_in collection: 'general', database: 'heroku_pvjp3t1v', client: 'payments'

  belongs_to :member, optional: true

  field :product
  field :firstname
  field :lastname
  field :amount, type: Float
  field :currency
  field :payment_date
  field :payer_email
  field :address
  field :txn_id
  field :txn_type
  field :test, type: Boolean

  def find_member
    unless !self.firstname || !self.lastname
      fullname = self.firstname + ' ' + self.lastname
       self.member = Member.where(fullname: fullname).first
      unless !!self.member || !self.payer_email
         self.member = Member.where(email: self.payer_email).first
        unless !!member || !self.lastname
           self.member = Member.where(fullname: Regexp.new(self.lastname)).first
          unless !!member || !self.payer_email
            payments = Payment.where(member: !nil, payer_email: self.payer_email)
            if payments.size > 0
               self.member = payments.sort_by { |p| p[:payment_date]}.first.member
            else
               self.member = nil
            end
          end
        end
      end
      return self.member
    end
  end
end
