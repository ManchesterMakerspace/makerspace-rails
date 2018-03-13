require 'rails_helper'

RSpec.describe "registrations/show", type: :view do
  before(:each) do
    @registration = assign(:registration, Registration.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
