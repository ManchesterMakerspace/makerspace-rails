require 'rails_helper'

RSpec.describe "calendars/show", type: :view do
  before(:each) do
    @calendar = assign(:calendar, Calendar.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
