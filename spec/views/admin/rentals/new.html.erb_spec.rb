require 'rails_helper'

RSpec.describe "admin/rentals/new", type: :view do
  before(:each) do
    assign(:admin_rental, Admin::Rental.new())
  end

  it "renders new admin_rental form" do
    render

    assert_select "form[action=?][method=?]", admin_rentals_path, "post" do
    end
  end
end
