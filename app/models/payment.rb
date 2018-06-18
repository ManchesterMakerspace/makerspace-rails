class Payment
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  belongs_to :member, optional: true
  after_initialize :find_member, on: :create

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

  def find_member
    unless !!self.member
      self.member = Member.search_members("#{self.firstname} #{self.lastname} #{self.payer_email}").first
      if !self.member && self.payer_email then
        payments = Payment.where(member: !nil, payer_email: self.payer_email).order_by(payment_date: :desc);
        self.member = payments.first.member unless payments.empty?
      end
      self.save
    end

    if self.member
      configure_subscription_status
    end
  end
end
