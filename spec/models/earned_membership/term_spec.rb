require 'rails_helper'

#https://github.com/mongoid/mongoid-rspec

RSpec.describe EarnedMembership::Term, type: :model do

  describe "public methods" do
    it "calculates term end date" do
      time_now = Time.now
      requirement = create(:requirement, term_length: 3)
      term = build(:term, start_date: time_now, requirement: requirement)
      expected_end_date = time_now + 3.months
      expect(term.end_date).to eq(expected_end_date)
    end
  end

  describe "private methods" do
    it "validates requirement exists" do
      term = build(:term, requirement: nil)
      expect(term.valid?).to be(false)
      term.save
      expect(term.persisted?).to be(false)
      term.requirement = create(:requirement)
      expect(term.valid?).to be(true)
      term.save
      expect(term.persisted?).to be(true)
    end

    it "creates next term" do
      requirement = create(:requirement, target_count: 3, rollover_limit: 1)
      term = create(:term, current_count: 5, requirement: requirement)
      term.send(:create_next_term)
      new_term = EarnedMembership::Term.last
      expect(new_term.current_count).to eq(1)
      expect(new_term.requirement_id).to eq(requirement.id)
      expect(new_term.start_date.to_i).to eq(term.end_date.to_i)
    end

    it "dispatches satisfaction chain" do
      membership = create(:earned_membership)
      requirement = create(:requirement, earned_membership: membership, target_count: 3, rollover_limit: 1)
      term = create(:term, requirement: requirement)
      expect(term).to receive(:create_next_term)
      expect(membership).to receive(:evaluate_for_renewal)
      term.update(current_count: 5)
      term.reload
      expect(term.satisfied).to be(true)
    end
  end
end