require 'rails_helper'

RSpec.describe "cards/new", type: :view do
  before(:each) do
    assign(:card, Card.new())
  end

  it "renders new card form" do
    render

    assert_select "form[action=?][method=?]", cards_path, "post" do
    end
  end
end
