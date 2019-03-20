import * as React from "react";
import range from "lodash-es/range";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import FormLabel from "@material-ui/core/FormLabel";

import { MemberDetails } from "app/entities/member";

import FormModal from "ui/common/FormModal";
import { getMember } from "api/members/transactions";
import { getMembers } from "api/members/transactions";
import Form from "ui/common/Form";
import { Checkbox, FormControlLabel, Button, Card, CardContent } from "@material-ui/core";
import { formPrefix, requirementFields, earnedMembershipFields } from "ui/earnedMemberships/constants";
import { EarnedMembership, Requirement } from "app/entities/earnedMembership";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";
import AsyncSelectFixed from "ui/common/AsyncSelect";

interface OwnProps {
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
  membership: Partial<EarnedMembership>;
  member?: Partial<MemberDetails>;
  title?: string;
  noDialog?: boolean;
  ref?: any;
}
type SelectOption = { label: string, value: string, id?: string };

interface State {
  requirementCount: number;
  member: SelectOption;
}

const requirementNamePrefix = `${formPrefix}-requirement-`;
export class EarnedMembershipForm extends React.Component<OwnProps, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: OwnProps) {
    super(props);
    this.state = {
      requirementCount: 1,
      member: undefined,
    }
  }

  private initMember = async () => {
    const { membership } = this.props;
    this.setState({ member: { value: membership.memberId, label: membership.memberName, id: membership.memberId } })
    if (membership && membership.memberId) {
      try {
        const { data } = await getMember(membership.memberId);
        const { member } = data;
        if (member) {
          this.updateMemberValue({ value: member.id, label: `${member.firstname} ${member.lastname}`, id: member.id });
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      this.updateMemberValue({ value: "", label: "None", id: undefined });
    }
  }

  // Need to update internal state and set form value since input is otherwise a controlled input
  private updateMemberValue = (newMember: SelectOption) => {
    this.setState({ member: newMember });
  }

  private addRequirement = () => {
    this.setState(state => ({ requirementCount: state.requirementCount + 1 }), () =>
      this.formRef && this.formRef.resetForm()
    );
  }
  private removeRequirement = () => {
    const index = this.state.requirementCount - 1;
    const fieldName = this.getRequirementName(index);
    this.formRef.setValue(fieldName, "");
    this.setState(state => ({ requirementCount: state.requirementCount - 1 || 1 }), () =>
      this.formRef && this.formRef.resetForm()
    );
  }

  public componentDidUpdate(prevProps: OwnProps) {
    const { isOpen: wasOpen } = prevProps;
    const { isOpen, member, membership } = this.props;
    if (isOpen === !wasOpen) {
      this.initMember();
      this.setState({ requirementCount: membership && Array.isArray(membership.requirements) ? membership.requirements.length : 1 });
    }
    if (member && member !== prevProps.member) {
      this.formRef && this.formRef.resetForm();
    }
  }

  public validate = async (form: Form) => {
    const values = form.getValues();
    const result = await form.simpleValidate<{ memberId: string }>(earnedMembershipFields);
    const {
      [earnedMembershipFields.memberId.name]: memberId,
      ...requirementValues
    } = values;

    const requirements: Requirement[] = [];
    Object.entries(requirementValues).reduce((requirements, [fieldName, value]) => {
      if (!fieldName || value === undefined) {
       return requirements;
     }
      const rowFieldName = fieldName.replace(requirementNamePrefix, ''); // get row key eg 0-rolloverLimit
      const [strIndex, prop] = rowFieldName.split('-'); // index in list, req prop
      const index = Number(strIndex); // Normalize string as number
      const relatedRequirement = requirements[index] || {} as Requirement; // Get req from list or create new one

      const { transform, validate, error } = requirementFields[prop]; // Transform, validate, then update
      const transformedVal = transform ? transform(value) : value;
      if (validate && !validate(transformedVal)) {
        form.setError(fieldName, error);
      } else {
        relatedRequirement[prop] = transformedVal;
        requirements[index] = relatedRequirement; // Replace in list
      }
      return requirements;
    }, requirements);

    return {
      ...result,
      requirements,
    };
  }

  private getRequirementName = (index: number) =>
    `${requirementNamePrefix}${index}`

  private renderRequirementRow = (index: number) => {
    const fieldName = this.getRequirementName(index);

    return (
      <Card>
        <CardContent>
          <Grid container spacing={24}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label={requirementFields.name.label}
                name={`${fieldName}-${requirementFields.name.name}`}
                id={`${fieldName}-${requirementFields.name.name}`}
                placeholder={requirementFields.name.placeholder}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={requirementFields.rolloverLimit.label}
                name={`${fieldName}-${requirementFields.rolloverLimit.name}`}
                id={`${fieldName}-${requirementFields.rolloverLimit.name}`}
                placeholder={requirementFields.rolloverLimit.placeholder}
              />
            </Grid>
            <Grid item xs={12}>
              <FormLabel component="legend">{requirementFields.termLength.label}</FormLabel>
              <Select
                name={`${fieldName}-${requirementFields.termLength.name}`}
                id={`${fieldName}-${requirementFields.termLength.name}`}
                fullWidth
                value="1"
                native
                required
                placeholder={requirementFields.termLength.placeholder}
              >
                {range(1, 12).map(int => (
                  <option
                    id={`${fieldName}-${requirementFields.termLength.name}-option-${int}`}
                    key={`${fieldName}-${requirementFields.termLength.name}-option-${int}`}
                    value={int}
                  >
                    {`${int} month(s)`}
                  </option>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label={requirementFields.targetCount.label}
                name={`${fieldName}-${requirementFields.targetCount.name}`}
                id={`${fieldName}-${requirementFields.targetCount.name}`}
                placeholder={requirementFields.targetCount.placeholder}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name={`${fieldName}-${requirementFields.strict.name}`}
                    id={`${fieldName}-${requirementFields.strict.name}`}
                    color="default"
                  />
                }
                label={requirementFields.strict.label}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }

  private memberOptions = async (searchValue: string) => {
    try {
      const membersResponse = await getMembers({ search: searchValue });
      const members: MemberDetails[] = membersResponse.data ? membersResponse.data.members : [];
      const memberOptions = members.map(member => ({ value: member.email, label: `${member.firstname} ${member.lastname}`, id: member.id }));
      return memberOptions;
    } catch (e) {
      console.log(e);
    }
  }

  private renderFormContents = () => {
    const { member } = this.props;

    return (
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <FormLabel component="legend">{earnedMembershipFields.memberId.label}</FormLabel>
          <AsyncSelectFixed
            isClearable
            name={earnedMembershipFields.memberId.name}
            value={this.state.member}
            onChange={this.updateMemberValue}
            isDisabled={member && !!member.id}
            placeholder={earnedMembershipFields.memberId.placeholder}
            id={earnedMembershipFields.memberId.name}
            loadOptions={this.memberOptions}
            getFormRef={() => this.formRef}
          />
        </Grid>
        <Grid item xs={12}>
        {range(0, this.state.requirementCount).map(index =>
            <Grid key={`requirement-${index}`} container spacing={24}>
              <Grid item xs={12}>
                {this.renderRequirementRow(index)}
              </Grid>
            </Grid >
          )}
        </Grid >
        <Grid item xs={12}>
          <ButtonRow
            actionButtons={[
              {
                color: "default",
                id: "add-requirement",
                variant: "outlined",
                onClick: this.addRequirement,
                label: "Add Requirement",
              },
              ...this.state.requirementCount > 1 ? [{
                color: "secondary",
                id: "remove-requirement",
                variant: "outlined",
                onClick: this.removeRequirement,
                label: "Remove Requirement",
              }] : []
            ] as ActionButton[]}
          />
        </Grid >
      </Grid >
    );
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, member, title, noDialog } = this.props;
    const contents = this.renderFormContents();
    const formProps = {
      id: formPrefix,
      loading: isRequesting,
      isOpen,
      closeHandler: onClose,
      title: title,
      onSubmit,
      error,
    }

    if (noDialog) {
      return <Form ref={this.setFormRef} {...formProps}>{contents}</Form>;
    } else {
      return <FormModal formRef={this.setFormRef} {...formProps}>{contents}</FormModal>;
    }
  }
}

export default EarnedMembershipForm;
