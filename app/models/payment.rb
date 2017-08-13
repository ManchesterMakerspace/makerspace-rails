class Payment
  include Mongoid::Document
  include ActiveModel::Serializers::JSON
  store_in collection: 'general', database: 'heroku_pvjp3t1v', client: 'payments'

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
    fullname = self.firstname + ' ' + self.lastname
    member = Member.where(fullname: fullname).first
    unless !!member
      member = Member.where(email: self.payer_email).first
      unless !!member
        member = Member.where(fullname: Regexp.new(self.lastname)).first
        unless !!member
          payments = Payment.where(member: !nil, payer_email: self.payer_email)
          if payments.size > 0
            member = payments.sort_by { |p| p[:payment_date]}.first.member
          else
            member = nil
          end
        end
      end
    end
    return member
  end
end
