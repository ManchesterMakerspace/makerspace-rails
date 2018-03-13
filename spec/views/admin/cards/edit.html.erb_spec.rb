require 'rails_helper'

RSpec.describe "admin/cards/edit", type: :view do
  before(:each) do
    @admin_card = assign(:admin_card, Admin::Card.create!())
  end

  it "renders the edit admin_card form" do
    render

    assert_select "form[action=?][method=?]", admin_card_path(@admin_card), "post" do
    end
  end
end
