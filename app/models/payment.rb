class Payment
  include Mongoid::Document
  store_in collection: 'generals', database: 'makerspacepayments', client: 'payments'

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
  field :processed, type: Boolean, default: false

  def self.update_members
    unless self.new_payments.size == 0
      self.new_payments.each do |payment|
        renewObj = {expTime: payment.calculate_months}
        member = payment.find_member
        if !!member
          payment.member = member #set member if found
          if payment.member.update({expirationTime: renewObj}) #if update succeeds
            payment.processed = true #mark processed
            payment.save
          end
        end
      end
    end
  end

  def self.prepare_updates
    unless self.new_payments.size == 0
      self.new_payments.collect do |payment| #return array of modified payments
        renewObj = {expTime: payment.calculate_months}
        member = payment.find_member
        if !!member
          payment.member = member
          payment.save
        end
        payment
      end
    end
  end

  def self.new_payments
    self.where(processed: false)
  end

  def find_member
    fullname = self.firstname + ' ' + self.lastname
    member = Member.where(fullname: fullname).first
    unless !!member
      member = Member.where(email: self.payer_email).first
      unless !!member
        member = Member.includes(fullname: self.lastname).first
      end
    end
    return member
  end

  def calculate_months
  end
end
