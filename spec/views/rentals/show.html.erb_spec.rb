require 'rails_helper'

RSpec.describe "rentals/show", type: :view do
  before(:each) do
    @rental = assign(:rental, Rental.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
