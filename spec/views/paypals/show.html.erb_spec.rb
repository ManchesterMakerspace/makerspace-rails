require 'rails_helper'

RSpec.describe "paypals/show", type: :view do
  before(:each) do
    @paypal = assign(:paypal, Paypal.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
