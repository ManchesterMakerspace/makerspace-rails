require 'rails_helper'

RSpec.describe "members/index", type: :view do
  before(:each) do
    assign(:members, [
      Member.create!(),
      Member.create!()
    ])
  end

  it "renders a list of members" do
    render
  end
end
