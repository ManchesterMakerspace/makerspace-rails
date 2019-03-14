require 'rails_helper'

#https://github.com/mongoid/mongoid-rspec

RSpec.describe EarnedMembership::Report, type: :model do

  describe "private methods" do
    it "validates earned_membership and report_requirements exists" do
      requirement = build(:requirement)
      report_requirement = build(:report_requirement, requirement: requirement)
      report = build(:report, earned_membership: nil, report_requirements: [report_requirement])
      expect(report.valid?).to be(false)
      report.save
      expect(report.persisted?).to be(false)
      report.earned_membership = create(:earned_membership, requirements: [requirement])
      expect(report.valid?).to be(true)
      report.save
      expect(report.persisted?).to be(true)

      other_report = build(:report, report_requirements: nil)
      expect(other_report.valid?).to be(false)
      other_report.save
      expect(other_report.persisted?).to be(false)
      other_report.report_requirements = [build(:report_requirement, report: other_report, requirement: requirement)]
      expect(other_report.valid?).to be(true)
      other_report.save
      expect(other_report.persisted?).to be(true)
    end

    it "validates users dont submit reports for the future" do
      EarnedMembership::Requirement.skip_callback(:create, :before, :build_first_term)
      term = build(:term, start_date: Time.now + 1.month)
      requirement = create(:requirement, terms: [term])
      report_requirement = build(:report_requirement, requirement: requirement)
      report = build(:report, report_requirements: [report_requirement])
      expect(report.valid?).to be(false)
      report.save
      expect(report.persisted?).to be(false)
      requirement.terms.first.update(start_date: Time.now)
      expect(report.valid?).to be(true)
      report.save
      expect(report.persisted?).to be(true)
      EarnedMembership::Requirement.set_callback(:create, :before, :build_first_term)
    end

    it "applies current term to report_requirements" do
      term = build(:term, start_date: Time.now)
      requirement = create(:requirement, terms: [term])
      report_requirement = build(:report_requirement, requirement: requirement)
      expect(report_requirement.term).to be(nil)
      report = create(:report, report_requirements: [report_requirement])
      expect(report.report_requirements.first.term).to eq(term)
    end

    it "processes report requirements" do
      term = build(:term, start_date: Time.now)
      requirement = create(:requirement, terms: [term])
      report_requirement = build(:report_requirement, requirement: requirement)
      expect(report_requirement).to receive(:update_term_count)
      report = create(:report, report_requirements: [report_requirement])
    end
  end
end