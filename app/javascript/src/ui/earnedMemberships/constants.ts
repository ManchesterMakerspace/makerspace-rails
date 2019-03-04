import { FormFields } from "ui/common/Form";
import { MemberDetails } from "app/entities/member";
import { Requirement } from "app/entities/earnedMembership";
import { isObject } from "lodash-es";
import { isUndefined } from "util";


export enum Action {
  StartReadRequest = "EARNED_MEMBERSHIP/START_READ_REQUEST",
  GetMembershipsSuccess = "EARNED_MEMBERSHIP/GET_MEMBERSHIPS_SUCCESS",
  GetMembershipsFailure = "EARNED_MEMBERSHIP/GET_MEMBERSHIPS_FAILURE",

  StartCreateRequest = "EARNED_MEMBERSHIP/START_CREATE_REQUEST",
  CreateMembershipSuccess = "EARNED_MEMBERSHIP/CREATE_RENTAL_SUCCESS",
  CreateMembershipFailure = "EARNED_MEMBERSHIP/CREATE_RENTAL_FAILURE",

  StartUpdateRequest = "EARNED_MEMBERSHIP/START_UPDATE_REQUEST",
  UpdateMembershipSuccess = "EARNED_MEMBERSHIP/UPDATE_RENTAL_SUCCESS",
  UpdateMembershipFailure = "EARNED_MEMBERSHIP/UPDATE_RENTAL_FAILURE",

  StartDeleteRequest = "EARNED_MEMBERSHIP/START_DELETE_REQUEST",
  DeleteMembershipSuccess = "EARNED_MEMBERSHIP/DELETE_RENTAL_SUCCESS",
  DeleteMembershipFailure = "EARNED_MEMBERSHIP/DELETE_RENTAL_FAILURE",
}

export const formPrefix = "earned-membership-form";
export const earnedMembershipFields = {
  memberId: {
    label: "Select a member",
    name: `${formPrefix}-member`,
    placeholder: `Search by name or email`,
    transform: (val: MemberDetails) => val && val.id,
    validate: (val: string) => !!val,
    error: "Member required"
  },
}

export const requirementFields: FormFields = {
  name: {
    label: "Requirement Name",
    name: `name`,
    placeholder: 'Enter a name for this requirement',
    validate: (val: string) => !!val,
    error: "Name is required"
  },
  rolloverLimit: {
    label: "Rollover Limit",
    name: `rolloverLimit`,
    placeholder: 'Enter a rollover limit (optional)',
    transform: (val) => Number(val),
    validate: (val: number) => val !== undefined && val > -1,
    error: "Invalid limit. Must be an integer"
  },
  termLength: {
    label: "Term Length",
    name: `termLength`,
    placeholder: 'Select number of months for this requirement',
    transform: (val) => Number(val),
    validate: (val) => !!val,
    error: "Term length is required"
  },
  targetCount: {
    label: "Count required for completion",
    name: `targetCount`,
    placeholder: 'Enter a number',
    transform: (val) => Number(val),
    validate: (val: number) => val > 0,
    error: "Invalid count. Must be great than 0"
  },
  strict: {
    label: "Strict reporting?",
    name: `strict`,
    transform: (val) => !!val,
  },
}

export const reportRequirementFields = (requirement: Requirement): FormFields => ({
  reportedCount: {
    label: "Completed count for this report",
    name: `${formPrefix}-reportedCount`,
    placeholder: 'Select a number',
    validate: (val: string) => !!Number(val),
    error: "Count is required"
  },
  memberId: {
    label: "Select the member you helped",
    name: `${formPrefix}-members`,
    placeholder: `Search by name or email`,
    transform: (val: MemberDetails | string) => isObject(val) ? (val as MemberDetails).id : val,
    validate: (val: string) => requirement.strict ? !!val : true,
    error: "Must select members for this requirement"
  },
})