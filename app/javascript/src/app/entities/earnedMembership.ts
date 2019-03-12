import { MemberStatus } from "app/entities/member";

export interface NewEarnedMembership {
  memberId: string;
  requirements: Requirement[];
}

export interface EarnedMembership extends NewEarnedMembership {
  id: string;
  memberName: string;
  memberStatus: MemberStatus;
  memberExpiration: number;
}

interface Term {
  currentCount: number;
  termStartDate: Date;
  termEndDate: Date;
  satisfied: boolean;
}

export interface Requirement extends Term {
  id: string;
  name: string;
  rolloverLimit: number;
  termLength: number;
  targetCount: number;
  strict: boolean;
  termId: string;
}

export interface NewReportRequirement {
  requirementId: string;
  reportedCount: number;
  appliedCount?: number;
  memberIds: string[];
  termId: string;
}

export interface ReportRequirement extends Term, NewReportRequirement {
  id: string;
}

export const isReportRequirement = (item: any): item is ReportRequirement =>
  item !== undefined && item.requirementId !== undefined;

export interface NewReport {
  earnedMembershipId: string;
  reportRequirements: NewReportRequirement[];
}
export interface Report extends NewReport {
  id: string;
  date: Date;
}