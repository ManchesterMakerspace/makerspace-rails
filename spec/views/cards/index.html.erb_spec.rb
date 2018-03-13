require 'rails_helper'

RSpec.describe "cards/index", type: :view do
  before(:each) do
    assign(:cards, [
      Card.create!(),
      Card.create!()
    ])
  end

  it "renders a list of cards" do
    render
  end
end
