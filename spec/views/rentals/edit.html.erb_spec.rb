require 'rails_helper'

RSpec.describe "rentals/edit", type: :view do
  before(:each) do
    @rental = assign(:rental, Rental.create!())
  end

  it "renders the edit rental form" do
    render

    assert_select "form[action=?][method=?]", rental_path(@rental), "post" do
    end
  end
end
