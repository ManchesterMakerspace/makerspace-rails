require 'rails_helper'

RSpec.describe "admin/cards/show", type: :view do
  before(:each) do
    @admin_card = assign(:admin_card, Admin::Card.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
