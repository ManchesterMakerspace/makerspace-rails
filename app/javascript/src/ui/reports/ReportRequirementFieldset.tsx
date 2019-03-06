import * as React from "react";
import range from "lodash-es/range";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormLabel from "@material-ui/core/FormLabel";

import { getMembers } from "api/members/transactions";

import { MemberDetails } from "app/entities/member";
import { Requirement, ReportRequirement } from "app/entities/earnedMembership";

import Form from "ui/common/Form";
import { reportRequirementFields } from "ui/reports/constants";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";
import { mapValues } from "lodash-es";
import AsyncSelectFixed from "ui/common/AsyncSelect";

interface OwnProps {
  requirement: Requirement;
  disabled: boolean;
  index: number;
}
type SelectOption = { label: string, value: string, id?: string };

interface State {
  memberCount: number;
}

class ReportRequirementFieldset extends React.Component<OwnProps, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: OwnProps) {
    super(props);
    this.state = {
      memberCount: 1,
    }
  }

  public componentDidUpdate(prevProps: OwnProps) {
    const { requirement } = this.props;
    if (requirement && requirement !== prevProps.requirement) {
      this.formRef && this.formRef.resetForm();
    }
  }

  public validate = async (): Promise<ReportRequirement> => {
    const { requirement, index } = this.props;
    const { id } = requirement;
    const reportRequirementValues = this.formRef.getValues();

    const reportRequirement: ReportRequirement = {
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
    const { requirement, disabled, index: requirementIndex } = this.props;
    const fieldName = this.getMemberInputName(index);
    const fields = reportRequirementFields(requirement, requirementIndex);
    const onChange = (option: SelectOption) =>
      this.formRef.setValue(fieldName, option);

    return (
      <Grid item xs={12}>
        <FormLabel component="legend">{fields.memberId.label}</FormLabel>
        <AsyncSelectFixed
          isClearable
          name={fieldName}
          placeholder={fields.memberId.placeholder}
          id={fieldName}
          onChange={onChange}
          isDisabled={disabled}
          loadOptions={this.memberOptions}
        />
      </Grid>
    )
  }

  private memberOptions = async (searchValue: string) => {
    try {
      const membersResponse = await getMembers({ search: searchValue });
      const members: MemberDetails[] = membersResponse.data ? membersResponse.data.members : [];
      const memberOptions = members.map(member => ({ value: member.id, label: `${member.firstname} ${member.lastname}`, id: member.id }));
      return memberOptions;
    } catch (e) {
      console.log(e);
    }
  }

  public render(): JSX.Element {
    const { requirement, disabled, index } = this.props;
    const fields = reportRequirementFields(requirement, index);

    return (
      <Form
        ref={this.setFormRef}
        id={`report-requirement-form-${index}`}
      >
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              disabled={disabled}
              label={fields.reportedCount.label}
              name={`${fields.reportedCount.name}`}
              id={`${fields.reportedCount.name}`}
              placeholder={fields.reportedCount.placeholder}
            />
          </Grid>
          <Grid item xs={12}>
            {range(0, this.state.memberCount).map(index =>
              <Grid key={`member-${index}`} container spacing={24}>
                <Grid item xs={12}>
                  {this.renderMemberRow(index)}
                </Grid>
              </Grid >
            )}
          </Grid >
          <Grid item xs={12}>
            <ButtonRow
              actionButtons={[
                {
                  color: "default",
                  id: "add-member-row",
                  variant: "outlined",
                  onClick: this.addMemberRow,
                  label: "Add Member",
                },
                ...this.state.memberCount > 1 ? [{
                  color: "secondary",
                  id: "add-member-row",
                  variant: "outlined",
                  onClick: this.removeMemberRow,
                  label: "Remove Member",
                }] : []
              ] as ActionButton[]}
            />
          </Grid >
        </Grid >
      </Form>

    );
  }
}

export default ReportRequirementFieldset;
