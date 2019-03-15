import { TablePageObject } from "./table";
import { Routing } from "app/constants";

const tableId = "memberships-table";
const rentalsListFields = ["lastname", "expirationTime", "status"];

class EarnedMembershipsPageObject extends TablePageObject {
  public listUrl = Routing.EarnedMemberships

  public actionButtons = {
    create: "#membership-list-create",
    edit: "#membership-list-edit",
    delete: "#membership-list-delete",
  }

  private membershipFormId = "#earned-membership-form";
  private requirementNamePrefix = `${this.membershipFormId}-requirement-{index}`;
  public membershipForm = {
    id: `${this.membershipFormId}`,
    requirementName: `${this.requirementNamePrefix}-name`,
    requirementRolloverLimit: `${this.requirementNamePrefix}-rolloverLimit`,
    requirementTermLengthSelect: `${this.requirementNamePrefix}-termLength`,
    requirementTermLengthOption: `${this.requirementNamePrefix}-termLength-{option}`,
    requirementTargetCount: `${this.requirementNamePrefix}-targetCount`,
    submit: `${this.membershipFormId}-submit`,
    cancel: `${this.membershipFormId}-cancel`,
    error: `${this.membershipFormId}-error`,
    loading: `${this.membershipFormId}-loading`,
  }
}

export default new EarnedMembershipsPageObject(tableId, rentalsListFields);