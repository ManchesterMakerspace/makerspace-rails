require 'rails_helper'

RSpec.describe "admin/cards/new", type: :view do
  before(:each) do
    assign(:admin_card, Admin::Card.new())
  end

  it "renders new admin_card form" do
    render

    assert_select "form[action=?][method=?]", admin_cards_path, "post" do
    end
  end
end
