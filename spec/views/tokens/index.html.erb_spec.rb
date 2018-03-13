require 'rails_helper'

RSpec.describe "tokens/index", type: :view do
  before(:each) do
    assign(:tokens, [
      Token.create!(),
      Token.create!()
    ])
  end

  it "renders a list of tokens" do
    render
  end
end
