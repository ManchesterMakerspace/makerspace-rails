class Payment
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  belongs_to :member, optional: true
  before_create :find_member

  field :product
  field :firstname
  field :lastname
  field :amount, type: Float
  field :currency
  field :status
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
      if self.member
        configure_subscription_status
      end
    end
  end

  private
  def configure_subscription_status
    true_types = ['subscr_signup', 'subscr_payment']
    false_types = ['subscr_eot', 'subscr_cancel', 'subscr_failed']
    #use specific false types so other donations/payments don't invalidate subscription
    if true_types.include?(self.txn_type)
        self.member.subscription = true
    elsif false_types.include?(self.txn_type)
        self.member.subscription = false
    end
    self.member.save
  end
end
