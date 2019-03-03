export interface EarnedMembership {
  id: string;
  memberId: string;
  memberName?: string;
  requirements: Requirement[];
}

export interface Requirement {
  id: string;
  name: string;
  rolloverLimit: number;
  termLength: number;
  termStartDate: Date;
  targetCount: number;
  currentCount: number;
  satisfied: boolean;
  strict: boolean;
}

export interface ReportRequirement {
  requirementId: string;
  reportedCount: number;
  appliedCount?: number;
  memberIds: string[];
}

export interface Report {
  earnedMembershipId: string;
  reportRequirements: ReportRequirement[];
}