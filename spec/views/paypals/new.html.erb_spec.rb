require 'rails_helper'

RSpec.describe "paypals/new", type: :view do
  before(:each) do
    assign(:paypal, Paypal.new())
  end

  it "renders new paypal form" do
    render

    assert_select "form[action=?][method=?]", paypals_path, "post" do
    end
  end
end
