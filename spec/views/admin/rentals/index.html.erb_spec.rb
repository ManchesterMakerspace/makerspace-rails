require 'rails_helper'

RSpec.describe "admin/rentals/index", type: :view do
  before(:each) do
    assign(:admin_rentals, [
      Admin::Rental.create!(),
      Admin::Rental.create!()
    ])
  end

  it "renders a list of admin/rentals" do
    render
  end
end
