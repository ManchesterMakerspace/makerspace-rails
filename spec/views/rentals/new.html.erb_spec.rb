require 'rails_helper'

RSpec.describe "rentals/new", type: :view do
  before(:each) do
    assign(:rental, Rental.new())
  end

  it "renders new rental form" do
    render

    assert_select "form[action=?][method=?]", rentals_path, "post" do
    end
  end
end
