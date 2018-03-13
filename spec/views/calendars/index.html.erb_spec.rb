require 'rails_helper'

RSpec.describe "calendars/index", type: :view do
  before(:each) do
    assign(:calendars, [
      Calendar.create!(),
      Calendar.create!()
    ])
  end

  it "renders a list of calendars" do
    render
  end
end
