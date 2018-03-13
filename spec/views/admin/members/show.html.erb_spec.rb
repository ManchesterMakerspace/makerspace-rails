require 'rails_helper'

RSpec.describe "admin/members/show", type: :view do
  before(:each) do
    @admin_member = assign(:admin_member, Admin::Member.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
