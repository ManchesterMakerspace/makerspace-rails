require 'rails_helper'

RSpec.describe "tokens/show", type: :view do
  before(:each) do
    @token = assign(:token, Token.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
