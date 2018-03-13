require 'rails_helper'

RSpec.describe "admin/cards/index", type: :view do
  before(:each) do
    assign(:admin_cards, [
      Admin::Card.create!(),
      Admin::Card.create!()
    ])
  end

  it "renders a list of admin/cards" do
    render
  end
end
