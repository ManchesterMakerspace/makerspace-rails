require 'rails_helper'

RSpec.describe "admin/members/edit", type: :view do
  before(:each) do
    @admin_member = assign(:admin_member, Admin::Member.create!())
  end

  it "renders the edit admin_member form" do
    render

    assert_select "form[action=?][method=?]", admin_member_path(@admin_member), "post" do
    end
  end
end
