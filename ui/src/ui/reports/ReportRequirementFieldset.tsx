import * as React from "react";
import range from "lodash-es/range";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormLabel from "@material-ui/core/FormLabel";
import Select from "@material-ui/core/Select";

import Form from "ui/common/Form";
import { reportRequirementFields, formPrefix } from "ui/reports/constants";
import ButtonRow, { ActionButtonProps } from "ui/common/ButtonRow";
import mapValues from "lodash-es/mapValues";
import {
  Requirement,
  ReportRequirement,
  NewReportRequirement,
} from "makerspace-ts-api-client";
import MemberSearchInput from "ui/common/MemberSearchInput";

interface OwnProps {
  requirement: Requirement;
  reportRequirement?: ReportRequirement;
  disabled: boolean;
  index: number;
}
type SelectOption = { label: string, value: string, id?: string };

interface State {
  memberCount: number;
  loadingMembersRequestId: string;
}

class ReportRequirementFieldset extends React.Component<OwnProps, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: OwnProps) {
    super(props);
    this.state = {
      memberCount: 1,
      loadingMembersRequestId: undefined,
    }
  }

  private initMembers = async () => {
    const { reportRequirement } = this.props;
    if (reportRequirement && reportRequirement.memberIds && reportRequirement.memberIds.length) {
      this.setState({ memberCount: (reportRequirement.memberIds).length || 1 });
    }
  }

  public componentDidMount() {
    this.initMembers();
  }

  public componentDidUpdate(prevProps: OwnProps) {
    const { requirement, reportRequirement } = this.props;
    if (requirement && requirement !== prevProps.requirement) {
      this.formRef && this.formRef.resetForm();
    }
    if (reportRequirement && reportRequirement !== prevProps.reportRequirement) {
      this.initMembers();
    }
  }

  public validate = async (): Promise<NewReportRequirement> => {
    const { requirement, index } = this.props;
    const { id } = requirement;
    const reportRequirementValues = this.formRef.getValues();

    const reportRequirement: NewReportRequirement = {
      requirementId: id,
      reportedCount: undefined,
      memberIds: [],
    };
    const formErrors = {}
    const fields = reportRequirementFields(requirement, index);

    // Iterate over form collecting & validating values
    Object.entries(reportRequirementValues).reduce((reportRequirement, [fieldName, value]) => {
      Object.entries(fields).map(async ([prop, field]) => {
        if (fieldName.startsWith(field.name)) {
          const transformedVal = field.transform ? field.transform(value) : value;
          const valid = field.validate ? field.validate(transformedVal) : true;

          // Return early if valid
          if (!valid) {
            formErrors[fieldName] = field.error;
            return reportRequirement;
          }

          // Evaluate memberIds only if exist
          if (prop === "memberId" && transformedVal) {
            if (reportRequirement.memberIds.includes(transformedVal)) {
              formErrors[fieldName] = "Duplicate member selected";
            }
            reportRequirement.memberIds.push(transformedVal);
          } else {
            reportRequirement[prop] = transformedVal;
          }
        }
      });

      return reportRequirement;
    }, reportRequirement);

    // Set error in first memebr input if no members for a strict reporting requirement
    if (requirement.strict && !reportRequirement.memberIds.length) {
      const memberIdField = fields.memberId;
      const fieldNames = Object.keys(reportRequirementValues);
      for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        if (fieldName.startsWith(memberIdField.name)) {
          formErrors[fieldName] = memberIdField.error;
          break;
        }
      }
    } else if (!reportRequirement && reportRequirement.memberIds.length) {
      const memberIdField = fields.memberId;
      const fieldNames = Object.keys(reportRequirementValues);
      for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        if (fieldName.startsWith(memberIdField.name)) {
          formErrors[fieldName] = "Cannot submit member without a number of completed requirements";
          break;
        }
      }
    }

    await this.formRef.setFormState({
      errors: formErrors,
      isDirty: true,
      touched: mapValues(reportRequirementValues, () => true)
    })

    return reportRequirement;
  }

  private addMemberRow = () => {
    this.setState(state => ({ memberCount: state.memberCount + 1 }), () =>
      this.formRef && this.formRef.resetForm()
    );
  }
  private removeMemberRow = () => {
    const index = this.state.memberCount - 1;
    const fieldName = this.getMemberInputName(index);
    this.formRef.setValue(fieldName, "");
    this.setState(state => ({ memberCount: state.memberCount - 1 || 1 }), () =>
      this.formRef && this.formRef.resetForm()
    );
  }

  private getMemberInputName = (index: number) => {
    const { requirement, index: requirementIndex } = this.props;
    const fields = reportRequirementFields(requirement, requirementIndex);
    return `${fields.memberId.name}-${index}`;
  }

  private renderMemberRow = (index: number) => {
    const { requirement, index: requirementIndex, reportRequirement, disabled } = this.props;
    const fieldName = this.getMemberInputName(index);
    const fields = reportRequirementFields(requirement, requirementIndex);

    const value = reportRequirement && reportRequirement.memberIds && reportRequirement.memberIds[index];
    return (
      <Grid item xs={12}>
        <FormLabel component="legend">{fields.memberId.label}</FormLabel>
        <MemberSearchInput
          disabled={disabled}
          placeholder={fields.memberId.placeholder}
          name={fieldName}
          getFormRef={() => this.formRef}
          initialSelection={{
            value,
            label: value
          }}
        />
      </Grid>
    )
  }

  public render(): JSX.Element {
    const { requirement, disabled, index, reportRequirement } = this.props;
    const fields = reportRequirementFields(requirement, index);
    const requirementFormId = `${formPrefix}-${index}`;
    return (
      <Form
        ref={this.setFormRef}
        id={requirementFormId}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormLabel>{fields.reportedCount.label}</FormLabel>
            <Select
              fullWidth
              required
              value={reportRequirement && reportRequirement.reportedCount || 0}
              disabled={disabled}
              name={`${fields.reportedCount.name}`}
              id={`${fields.reportedCount.name}`}
              placeholder={fields.reportedCount.placeholder}
            >
              {range(0, 12).map(i => <MenuItem key={i} value={String(i)}>{String(i)}</MenuItem>)}
            </Select>
          </Grid>
          <Grid item xs={12}>
            {range(0, this.state.memberCount).map(index =>
              <Grid key={`member-${index}`} container spacing={3}>
                <Grid item xs={12}>
                  {this.renderMemberRow(index)}
                </Grid>
              </Grid >
            )}
          </Grid >
          {!disabled && (
            <Grid item xs={12}>
              <ButtonRow
                actionButtons={[
                  {
                    color: "default",
                    id: `${requirementFormId}-add-member-row`,
                    variant: "outlined",
                    onClick: this.addMemberRow,
                    label: "Add Member",
                  },
                  ...this.state.memberCount > 1 ? [{
                    color: "secondary",
                    id: `${requirementFormId}-remove-member-row`,
                    variant: "outlined",
                    onClick: this.removeMemberRow,
                    label: "Remove Member",
                  }] : []
                ] as ActionButtonProps[]}
              />
            </Grid >
          )}
        </Grid >
      </Form>

    );
  }
}

export default ReportRequirementFieldset;
