require 'rails_helper'

RSpec.describe "sessions/index", type: :view do
  before(:each) do
    assign(:sessions, [
      Session.create!(),
      Session.create!()
    ])
  end

  it "renders a list of sessions" do
    render
  end
end
