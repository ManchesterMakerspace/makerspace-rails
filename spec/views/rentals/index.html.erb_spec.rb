require 'rails_helper'

RSpec.describe "rentals/index", type: :view do
  before(:each) do
    assign(:rentals, [
      Rental.create!(),
      Rental.create!()
    ])
  end

  it "renders a list of rentals" do
    render
  end
end
