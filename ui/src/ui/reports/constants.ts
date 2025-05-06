import { FormFields } from "ui/common/Form";
import { Requirement } from "makerspace-ts-api-client";
import isObject from "ui/utils/isObject";
import { SelectOption } from "ui/common/RenewalForm";

export const formPrefix = "report-form";
export const reportRequirementFields = (requirement: Requirement, index: number): FormFields => ({
  reportedCount: {
    label: `Number of completed ${requirement.name.toLowerCase()} for this report`,
    name: `${formPrefix}-${index}-reportedCount`,
    placeholder: 'Select a number',
    validate: (val: string) => val !== undefined && val !== "" && Number(val) >= 0,
    error: "Please enter a number"
  },
  memberId: {
    label: "Select a member you helped",
    name: `${formPrefix}-${index}-members`,
    placeholder: `Search by name or email`,
    transform: (val: SelectOption | string) => isObject(val) ? (val as SelectOption).value : val,
    error: "Must select members you helped for this requirement"
  },
});
