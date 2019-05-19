require 'rails_helper'

RSpec.describe BraintreeService::Transaction, type: :model do
  it "has a valid factory" do
    expect(build(:transaction)).to be_valid
  end

  context "public methods" do
    describe "refund" do
      # TODO need to determine how mocking gateway works
    end
  end
end