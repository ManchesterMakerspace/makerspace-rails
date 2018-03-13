require 'rails_helper'

RSpec.describe "paypals/edit", type: :view do
  before(:each) do
    @paypal = assign(:paypal, Paypal.create!())
  end

  it "renders the edit paypal form" do
    render

    assert_select "form[action=?][method=?]", paypal_path(@paypal), "post" do
    end
  end
end
