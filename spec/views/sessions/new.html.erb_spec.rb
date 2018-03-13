require 'rails_helper'

RSpec.describe "sessions/new", type: :view do
  before(:each) do
    assign(:session, Session.new())
  end

  it "renders new session form" do
    render

    assert_select "form[action=?][method=?]", sessions_path, "post" do
    end
  end
end
