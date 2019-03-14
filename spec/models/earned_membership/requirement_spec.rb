require 'rails_helper'

#https://github.com/mongoid/mongoid-rspec

RSpec.describe EarnedMembership::Requirement, type: :model do

  describe "public methods" do
    it "selects the current unsatisfied term" do
      EarnedMembership::Requirement.skip_callback(:create, :before, :build_first_term)
      req = create(:requirement, terms: FactoryBot.create_list(:term, 2, satisfied: true))
      new_term = build(:term)
      req.terms.push(new_term)
      req.save
      expect(req.current_term).to eq(EarnedMembership::Term.last)
      expect(req.current_term.start_date).to eq(new_term.start_date)
      EarnedMembership::Requirement.set_callback(:create, :before, :build_first_term)
    end
  end

  describe "private methods" do
    it "validates earned_membership exists" do
      req = build(:requirement)
      req.earned_membership = nil
      expect(req.valid?).to be(false)
      req.save
      expect(req.persisted?).to be(false)
      req.earned_membership = create(:earned_membership)
      expect(req.valid?).to be(true)
      req.save
      expect(req.persisted?).to be(true)
    end

    it "creates first term on create" do
      req = build(:requirement)
      expect(req.terms).to eq([])
      req.save
      expect(req.persisted?).to be(true)
      expect(req.terms).to eq([EarnedMembership::Term.last])
    end
  end
end