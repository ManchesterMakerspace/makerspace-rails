require 'rails_helper'

RSpec.describe "members/edit", type: :view do
  before(:each) do
    @member = assign(:member, Member.create!())
  end

  it "renders the edit member form" do
    render

    assert_select "form[action=?][method=?]", member_path(@member), "post" do
    end
  end
end
