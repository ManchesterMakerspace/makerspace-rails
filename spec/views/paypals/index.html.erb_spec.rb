require 'rails_helper'

RSpec.describe "paypals/index", type: :view do
  before(:each) do
    assign(:paypals, [
      Paypal.create!(),
      Paypal.create!()
    ])
  end

  it "renders a list of paypals" do
    render
  end
end
