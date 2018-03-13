require 'rails_helper'

RSpec.describe "members/new", type: :view do
  before(:each) do
    assign(:member, Member.new())
  end

  it "renders new member form" do
    render

    assert_select "form[action=?][method=?]", members_path, "post" do
    end
  end
end
