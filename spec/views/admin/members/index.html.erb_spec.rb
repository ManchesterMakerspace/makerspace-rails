require 'rails_helper'

RSpec.describe "admin/members/index", type: :view do
  before(:each) do
    assign(:admin_members, [
      Admin::Member.create!(),
      Admin::Member.create!()
    ])
  end

  it "renders a list of admin/members" do
    render
  end
end
