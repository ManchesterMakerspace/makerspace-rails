import * as React from "react";
import range from "lodash-es/range";
import Grid from "@material-ui/core/Grid";
import { Card, CardContent, Typography } from "@material-ui/core";

import { MemberDetails } from "app/entities/member";

import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";
import { EarnedMembership, Requirement, ReportRequirement, Report, NewReport, isReportRequirement, NewReportRequirement, Term } from "app/entities/earnedMembership";
import ReportRequirementFieldset from "ui/reports/ReportRequirementFieldset";
import KeyValueItem from "ui/common/KeyValueItem";
import { timeToDate } from "ui/utils/timeToDate";
import { formPrefix } from "ui/reports/constants";

interface OwnProps {
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit?: (form: Form) => void;
  membership: EarnedMembership;
  member: Partial<MemberDetails>;
  report?: Report;
  disabled?: boolean;
}
type SelectOption = { label: string, value: string, id?: string };
interface ItemWithTerm extends Partial<Term> {};

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

    report.reportRequirements = await Promise.all<NewReportRequirement>(this.reportRequirementRefs.map((ref, index) => {
      return new Promise(async (resolve) => {
        const reportRequirement = await ref.validate();
        resolve(reportRequirement);
      });
    }));


    // Halt validation if any subforms invalid
    if (this.reportRequirementRefs.some(ref => !ref.formRef.isValid())) {
      return;
    }

    return report;
  }

  private isFutureRequirement = (requirement: Requirement | ReportRequirement): boolean => {
    const reqStart = typeof requirement.termStartDate === "string" ? new Date(requirement.termStartDate) : requirement.termStartDate;
    return reqStart > new Date()
  }

  private renderRequirementForm = (requirement: Requirement | ReportRequirement, index: number) => {
    const { report, membership } = this.props;
    const baseReq = isReportRequirement(requirement) ?
      membership.requirements.find(req => requirement.requirementId === req.id)
      : requirement

    const futureTerm = this.isFutureRequirement(requirement)

    return (
      <Card>
        <CardContent>
          <Grid item xs={12}>
            <KeyValueItem label="Name">{baseReq.name}</KeyValueItem>
          </Grid>
          {
            futureTerm && !report ?
            <Typography variant="body1">Requirement has been satisfied for current term.</Typography>
            : (
              <>
                  <Grid item xs={12}>
                    <KeyValueItem label="Reporting Term">
                      <span id={`${formPrefix}-termStart`}>
                        {timeToDate(requirement.termStartDate)}
                      </span> -
                      <span id={`${formPrefix}-termEnd`}>
                        {timeToDate(requirement.termEndDate)}
                      </span>
                    </KeyValueItem>
                  </Grid>
                  {report ?
                    <>
                      <Grid item xs={12}>
                        <KeyValueItem label="Report Date">
                          <span id={`${formPrefix}-date`}>
                            {timeToDate(report.date)}
                          </span>
                        </KeyValueItem>
                      </Grid>
                    </>
                    : <>
                      <Grid item xs={12}>
                        <KeyValueItem label={`Number of ${baseReq.name}(s) required per term`}>
                          <span id={`${formPrefix}-targetCount`}>
                            {String(baseReq.targetCount)}
                          </span>
                        </KeyValueItem>
                      </Grid>
                      <Grid item xs={12}>
                        <KeyValueItem label="Number completed this term">
                          <span id={`${formPrefix}-targetCount`}>
                            {String(requirement.currentCount)}
                          </span>
                        </KeyValueItem>
                      </Grid>
                    </>
                  }
                  <ReportRequirementFieldset
                    disabled={this.props.disabled}
                    requirement={baseReq}
                    reportRequirement={isReportRequirement(requirement) && requirement}
                    index={index}
                    ref={(ref) => this.reportRequirementRefs[index] = ref}
                  />
              </>
            )
          }
        </CardContent>
      </Card>
    )
  }

  // If things get out of sync, we need a way to notifiy the user
  private renderErrorNotification = () => {
    return (
      <Typography variant="body1">
        You have no current requirements to report, which usually indicates an error in our system.
        Please <a href='mailto:contact@manchestermakerspace.org"'>email us</a> so we can straighten things out.
      </Typography>
    )
  }

  private getRequirements = () => {
    const { membership, report } = this.props;
    const requirements = report ? report.reportRequirements : membership && membership.requirements;
    return requirements;
  }

  private renderRequirements = () => {
    const requirements = this.getRequirements();

    return (requirements as ReportRequirement[]).map((requirement, index) =>
      <div key={requirement.id}>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            {this.renderRequirementForm(requirement, index)}
          </Grid>
        </Grid>
      </div>
    )
  }
  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, membership, report } = this.props;
    const requirements = this.getRequirements();

    const allReqComplete = requirements && (requirements as ItemWithTerm[]).every(this.isFutureRequirement);

    return membership ?
      <FormModal
        formRef={this.setFormRef}
        id={formPrefix}
        loading={isRequesting}
        error={error}
        onSubmit={!allReqComplete && onSubmit}
        closeHandler={onClose}
        cancelText={!onSubmit && "Close"}
        isOpen={isOpen}
        title={onSubmit ? "Submit Earned Membership Report" : "View Earned Membership Report"}
      >
        { (requirements || []).length ?
          this.renderRequirements()
          : this.renderErrorNotification()
        }
      </FormModal> : null;
  }
}

export default ReportForm;
