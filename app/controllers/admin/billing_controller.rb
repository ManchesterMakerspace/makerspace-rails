class Admin::BillingController < AdminController
  include BraintreeGateway
  include FastQuery::BraintreeQuery
end