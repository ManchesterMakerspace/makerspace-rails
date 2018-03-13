require 'rails_helper'

RSpec.describe "admin/rentals/show", type: :view do
  before(:each) do
    @admin_rental = assign(:admin_rental, Admin::Rental.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
