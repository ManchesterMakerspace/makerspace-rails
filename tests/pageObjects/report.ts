import { TablePageObject } from "./table";
import utils from "./common";
const tableId = "membership-reports-table";
import { MemberDetails } from "app/entities/member";
import { Report } from "app/entities/earnedMembership";
import { timeToDate } from "ui/utils/timeToDate";

const reportsListFields = ["date", "view"];
class ReportsPageObject extends TablePageObject {
  public actionButtons = {
    create: "#report-list-create",
  }

  public fieldEvaluator = (member?: Partial<MemberDetails>) => (report: Partial<Report>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "date") {
      expect(text).toEqual(timeToDate(report.date));
    } else {
      expect(text.includes(report[field])).toBeTruthy();
    }
  }

  public viewReport = (rowId: string) => {
    const { view: viewId } = this.getColumnIds(reportsListFields, rowId);
    return utils.clickElement(`${viewId} button`);
  }

  private reportFormId = "#report-form";
  private reportRequirementFormId = "#report-form-{requirementIndex}";

  public getReportRequirementPrefix = (index: number) =>
    this.reportRequirementFormId.replace("{requirementIndex}", String(index));

  public reportRequirementForm = (index: number) => ({
    reportedCount: `${this.getReportRequirementPrefix(index)}-reportedCount`,
    member: this.memberInput(index),
    addMemberButton: `${this.getReportRequirementPrefix(index)}-add-member-row`,
    removeMemberButton: `${this.getReportRequirementPrefix(index)}-remove-member-row`,
  });
  public memberInput = (formIndex: number) => (memberIndex: number) =>
    `${this.getReportRequirementPrefix(formIndex)}-members-${memberIndex}`;

  public reportForm = {
    id: `${this.reportFormId}`,
    requirementName: `${this.reportFormId}-name`,
    requirementTermStart: `${this.reportFormId}-termStart`,
    requirementTermEnd: `${this.reportFormId}-termEnd`,
    requirementTargetCount: `${this.reportFormId}-targetCount`,
    requirementCompleted: `${this.reportFormId}-completed`,
    reportDate: `${this.reportFormId}-date`,

    submit: `${this.reportFormId}-submit`,
    cancel: `${this.reportFormId}-cancel`,
    error: `${this.reportFormId}-error`,
    loading: `${this.reportFormId}-loading`,
  }
}

export default new ReportsPageObject(tableId, reportsListFields);