class BraintreeService::Dispute < Braintree::Dispute
  def self.new(args)
    super(args)
  end
end