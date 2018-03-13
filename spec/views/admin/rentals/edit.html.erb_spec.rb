require 'rails_helper'

RSpec.describe "admin/rentals/edit", type: :view do
  before(:each) do
    @admin_rental = assign(:admin_rental, Admin::Rental.create!())
  end

  it "renders the edit admin_rental form" do
    render

    assert_select "form[action=?][method=?]", admin_rental_path(@admin_rental), "post" do
    end
  end
end
