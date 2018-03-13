require 'rails_helper'

RSpec.describe "tokens/edit", type: :view do
  before(:each) do
    @token = assign(:token, Token.create!())
  end

  it "renders the edit token form" do
    render

    assert_select "form[action=?][method=?]", token_path(@token), "post" do
    end
  end
end
