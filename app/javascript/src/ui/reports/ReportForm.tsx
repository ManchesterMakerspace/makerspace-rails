import * as React from "react";
import Grid from "@material-ui/core/Grid";
import { Card, CardContent } from "@material-ui/core";

import { MemberDetails } from "app/entities/member";

import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";
import { EarnedMembership, Requirement, ReportRequirement, Report, NewReport } from "app/entities/earnedMembership";
import ReportRequirementFieldset from "ui/reports/ReportRequirementFieldset";
import KeyValueItem from "ui/common/KeyValueItem";
import { timeToDate } from "ui/utils/timeToDate";
import { formPrefix } from "ui/reports/constants";

interface OwnProps {
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
  membership: EarnedMembership;
  member: Partial<MemberDetails>;
  disabled?: boolean;
}
type SelectOption = { label: string, value: string, id?: string };

export class ReportForm extends React.Component<OwnProps> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;
  private reportRequirementRefs: ReportRequirementFieldset[] = [];

  public componentDidUpdate(prevProps: OwnProps) {
    const { member } = this.props;
    if (member && member !== prevProps.member) {
      this.formRef && this.formRef.resetForm();
    }
  }

  public validate = async (form: Form) => {
    const{ membership } = this.props;
    const report: NewReport = {
      earnedMembershipId: membership.id,
      reportRequirements: []
    };

    report.reportRequirements = await Promise.all<ReportRequirement>(this.reportRequirementRefs.map((ref, index) => {
      return new Promise(async (resolve) => {
        const reportRequirement = ref.validate();
        resolve(reportRequirement);
      });
    }));

    // Halt validation if any subforms invalid
    if (this.reportRequirementRefs.some(ref => !ref.formRef.isValid())) {
      console.log("HALT")
      return;
    }
    console.log(report);

    return report;
  }

  private renderRequirementForm = (requirement: Requirement, index: number) => {

    return (
      <Card>
        <CardContent>
          <Grid item xs={12}>
            <KeyValueItem label="Name">{requirement.name}</KeyValueItem>
          </Grid>
          <Grid item xs={12}>
            <KeyValueItem label="Reporting Term">
              {`${timeToDate(requirement.termStartDate)} - ${timeToDate(requirement.termEndDate)}`}
            </KeyValueItem>
          </Grid>
          <Grid item xs={12}>
            <KeyValueItem label="# required per term">{String(requirement.targetCount)}</KeyValueItem>
          </Grid>
          <Grid item xs={12}>
            <KeyValueItem label="# completed">{String(requirement.currentCount)}</KeyValueItem>
          </Grid>
          <ReportRequirementFieldset
            disabled={this.props.disabled}
            requirement={requirement}
            index={index}
            ref={(ref) => this.reportRequirementRefs[index] = ref}
          />
        </CardContent>
      </Card>
    )
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, disabled, membership } = this.props;

    return membership ?
      <FormModal
        formRef={this.setFormRef}
        id={formPrefix}
        loading={isRequesting}
        error={error}
        onSubmit={!disabled && this.validate}
        closeHandler={onClose}
        isOpen={isOpen}
        title="Submit Earned Membership Report"
      >
        {(membership.requirements || []).map((requirement, index) =>
       <div key={requirement.id}>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            {this.renderRequirementForm(requirement, index)}
          </Grid>
        </Grid>
       </div>
      )}
      </FormModal> : null;
  }
}

export default ReportForm;
