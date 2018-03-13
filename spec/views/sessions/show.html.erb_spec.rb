require 'rails_helper'

RSpec.describe "sessions/show", type: :view do
  before(:each) do
    @session = assign(:session, Session.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
