class BillingController < AuthenticationController
  include BraintreeGateway
  include FastQuery::BraintreeQuery
end