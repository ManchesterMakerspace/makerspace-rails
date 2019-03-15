import { TablePageObject } from "./table";
const tableId = "membership-reports-table";
const rentalsListFields = ["date", "reportRequirements", "view"];

class ReportsPageObject extends TablePageObject {
  public actionButtons = {
    create: "#report-list-create",
  }

  private reportFormId = "#report-form";
  private reportRequirementFormId = "#report-requirement-form-{requirementIndex}";
  public reportForm = {
    id: `${this.reportFormId}`,
    requirementName: `${this.reportFormId}-name`,
    requirementTermStart: `${this.reportFormId}-termStart`,
    requirementTermEnd: `${this.reportFormId}-termEnd`,
    requirementTargetCount: `${this.reportFormId}-targetCount`,

    reportDate: `${this.reportFormId}-date`,
    requirementCompleted: `${this.reportFormId}-completed`,

    reportedCount: `${this.reportFormId}-reportedCount-{requirementIndex}`,
    member: `${this.reportFormId}-memberId-{requirementIndex}-{memberIndex}`,
    addMemberButton: `${this.reportRequirementFormId}-add-member-row`,
    removeMemberButton: `${this.reportRequirementFormId}-remove-member-row`,

    submit: `${this.reportFormId}-submit`,
    cancel: `${this.reportFormId}-cancel`,
    error: `${this.reportFormId}-error`,
    loading: `${this.reportFormId}-loading`,
  }
}

export default new ReportsPageObject(tableId, rentalsListFields);