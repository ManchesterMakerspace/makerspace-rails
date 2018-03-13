require 'rails_helper'

RSpec.describe "registrations/index", type: :view do
  before(:each) do
    assign(:registrations, [
      Registration.create!(),
      Registration.create!()
    ])
  end

  it "renders a list of registrations" do
    render
  end
end
