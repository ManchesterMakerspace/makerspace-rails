require 'rails_helper'

RSpec.describe "registrations/new", type: :view do
  before(:each) do
    assign(:registration, Registration.new())
  end

  it "renders new registration form" do
    render

    assert_select "form[action=?][method=?]", registrations_path, "post" do
    end
  end
end
