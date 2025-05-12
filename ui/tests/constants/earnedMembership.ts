import moment from "moment";
import { EarnedMembership, Report, Requirement, ReportRequirement, MemberStatus } from "makerspace-ts-api-client";

export const basicRequirement: Requirement = {
  id: "test-requirement",
  earnedMembershipId: "test-earned-membership",
  name: "Test Requirement",
  rolloverLimit: 0,
  termLength: 1,
  targetCount: 3,
  currentCount: 0,
  strict: false,
  termStartDate: moment().toString(),
  termEndDate: moment().add(1, "months").toString(),
  termId: "test-term-id",
  satisfied: false
};


export const basicReportRequirement: ReportRequirement = {
  id: "test-report-requirement",
  requirementId: "test-requirement",
  reportedCount: 1,
  memberIds: [],
  appliedCount: 1,
  currentCount: 1,
  termStartDate: moment().toString(),
  termEndDate: moment().add(1, "months").toString(),
  satisfied: false
};

export const basicEarnedMembership: EarnedMembership = {
  id: "test-earned-membership",
  memberId: "test-member",
  memberName: "Test Member",
  memberStatus: MemberStatus.ActiveMember,
  memberExpiration: (moment().add(1, "months").valueOf()),
  requirements: [basicRequirement]
};

export const basicReport: Report = {
  id: "test-report",
  date: moment().toDate().toString(),
  earnedMembershipId: "test-earned-membership",
  reportRequirements: [basicReportRequirement]
};

export const defaultMemberships: EarnedMembership[] = new Array(20).fill(undefined).map((_v, index) => {
  const expirationNum = (Date.now() % 6);
  let expirationTime: number;
  switch (expirationNum) {
    case 0:
      expirationTime = (moment().subtract(1, "months").valueOf())
      break;
    case 4:
    case 5:
      expirationTime = (moment().add(3, "months").valueOf())
      break;
    case 1:
    case 2:
    case 3:
      expirationTime = (moment().add(1, "months").valueOf())
      break;
  }
  return {
    ...basicEarnedMembership,
    id: `test_membership_${index}`,
    memberName: `Test Membership ${index}`,
    memberExpiration: expirationTime
  }
});

export const defaultReports: Report[] = new Array(20).fill(undefined).map((_, index) => {
  const expirationNum = (Date.now() % 6);
  let date: Date;
  switch (expirationNum) {
    case 0:
      date = (moment().toDate())
      break;
    case 4:
    case 5:
      date = (moment().subtract(3, "months").toDate())
      break;
    case 1:
    case 2:
    case 3:
      date = (moment().subtract(1, "months").toDate())
      break;
  }
  return {
    ...basicReport,
    id: `test_report_${index}`,
    date: date.toString()
  }
})
