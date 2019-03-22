require 'rails_helper'

#https://github.com/mongoid/mongoid-rspec

RSpec.describe EarnedMembership::ReportRequirement, type: :model do

  describe "public methods" do
    it "updates term count" do
    end
  end

  describe "private methods" do
    it "validates requirement exists" do
      report = build(:report)
      report_requirement = build(:report_requirement_with_term, requirement: nil, report: report)
      expect(report_requirement.valid?).to be(false)
      report.save
      expect(report_requirement.persisted?).to be(false)

      report_requirement.requirement = create(:requirement)
      expect(report_requirement.valid?).to be(true)
      report.save
      expect(report_requirement.persisted?).to be(true)
    end

    it "validates term exists" do
      EarnedMembership::Report.skip_callback(:validation, :before, :apply_term)
      report = build(:report)
      requirement = create(:requirement, term_length: 1)
      report_requirement = build(:report_requirement, report: report, requirement: requirement)
      expect(report_requirement.valid?).to be(false)
      report.save
      expect(report_requirement.persisted?).to be(false)

      report_requirement.term = create(:term, start_date: Time.now - 1.month)
      expect(report_requirement.valid?).to be(true)
      report.save
      expect(report_requirement.persisted?).to be(true)
      EarnedMembership::Report.set_callback(:validation, :before, :apply_term)
    end
  end
end