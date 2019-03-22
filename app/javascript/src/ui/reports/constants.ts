import { FormFields } from "ui/common/Form";
import { MemberDetails } from "app/entities/member";
import { Requirement } from "app/entities/earnedMembership";
import { isObject } from "lodash-es";


export enum Action {
  StartReadRequest = "REPORTS/START_READ_REQUEST",
  GetReportsSuccess = "REPORTS/GET_REPORTS_SUCCESS",
  GetReportsFailure = "REPORTS/GET_REPORTS_FAILURE",

  StartCreateRequest = "REPORTS/START_CREATE_REQUEST",
  CreateReportSuccess = "REPORTS/CREATE_REPORTS_SUCCESS",
  CreateReportFailure = "REPORTS/CREATE_REPORTS_FAILURE",
}

export const formPrefix = "report-form";
export const reportRequirementFields = (requirement: Requirement, index: number): FormFields => ({
  reportedCount: {
    label: `Number of completed ${requirement.name.toLowerCase()} for this report`,
    name: `${formPrefix}-${index}-reportedCount`,
    placeholder: 'Select a number',
    validate: (val: string) => !!Number(val),
    error: "Please enter a number"
  },
  memberId: {
    label: "Select a member you helped",
    name: `${formPrefix}-${index}-members`,
    placeholder: `Search by name or email`,
    transform: (val: MemberDetails | string) => isObject(val) ? (val as MemberDetails).id : val,
    error: "Must select members you helped for this requirement"
  },
});
