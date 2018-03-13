require 'rails_helper'

RSpec.describe "tokens/new", type: :view do
  before(:each) do
    assign(:token, Token.new())
  end

  it "renders new token form" do
    render

    assert_select "form[action=?][method=?]", tokens_path, "post" do
    end
  end
end
