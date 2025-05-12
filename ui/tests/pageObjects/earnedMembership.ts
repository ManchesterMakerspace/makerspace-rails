import { expect } from "chai";
import { TablePageObject } from "./table";
import { Routing } from "app/constants";
import { timeToDate } from "ui/utils/timeToDate";
import { EarnedMembership } from "makerspace-ts-api-client";

const tableId = "memberships-table";
const emListFields = ["lastname", "expirationTime", "status"];

class EarnedMembershipsPageObject extends TablePageObject {
  public listUrl = Routing.EarnedMemberships

  public fieldEvaluator = (membership: Partial<EarnedMembership>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "expirationTime") {
      expect(text).to.eql(timeToDate(membership.memberExpiration));
    } else if (field === "status") {
      expect(
        ["Active", "Expired"].some((status => new RegExp(status, 'i').test(text)))
      ).to.be.true;
    } else if (field === "lastname") {
      expect(text).to.eql(membership.memberName);
    } else {
      expect(text.includes(membership[field])).to.be.true;
    }
  }

  public actionButtons = {
    create: "#membership-list-create",
    edit: "#membership-list-edit",
    delete: "#membership-list-delete",
  }

  public getRequirementPrefix = (index: number) => this.requirementNamePrefix.replace("{index}", String(index));

  private membershipFormId = "#earned-membership-form";
  private requirementNamePrefix = `${this.membershipFormId}-requirement-{index}`;
  public requirementForm = (index: number) => ({
    nameSelect: `${this.getRequirementPrefix(index)}-name-select`,
    nameInput: `${this.getRequirementPrefix(index)}-name`,
    rolloverLimit: `${this.getRequirementPrefix(index)}-rolloverLimit`,
    termLengthSelect: `${this.getRequirementPrefix(index)}-termLength`,
    targetCount: `${this.getRequirementPrefix(index)}-targetCount`,
  })
  public membershipForm = {
    id: `${this.membershipFormId}`,
    submit: `${this.membershipFormId}-submit`,
    cancel: `${this.membershipFormId}-cancel`,
    error: `${this.membershipFormId}-error`,
    loading: `${this.membershipFormId}-loading`,
    member: `${this.membershipFormId}-member`,
    addRequirementButton: "#add-requirement",
    removeRequirementButton: "#remove-requirement"
  }
}

export default new EarnedMembershipsPageObject(tableId, emListFields);