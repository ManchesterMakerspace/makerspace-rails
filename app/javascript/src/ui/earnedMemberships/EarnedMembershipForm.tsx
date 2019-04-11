import * as React from "react";
import range from "lodash-es/range";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";

import { MemberDetails } from "app/entities/member";

import FormModal from "ui/common/FormModal";
import { getMember } from "api/members/transactions";
import { getMembers } from "api/members/transactions";
import Form from "ui/common/Form";
import { formPrefix, requirementFields, earnedMembershipFields, RequirementNames } from "ui/earnedMemberships/constants";
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
  strictMap: boolean[];
  requirementNames: string[]
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
      strictMap: [],
      requirementNames: [],
    }
  }

  private initMember = async () => {
    const { membership } = this.props;
    if (membership && membership.memberId) {
      this.setState({ member: { value: membership.memberId, label: membership.memberName, id: membership.memberId } })
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
      this.setState({
        requirementCount: membership && Array.isArray(membership.requirements) ? membership.requirements.length : 1,
        strictMap: membership ? (membership.requirements || []).map(req => req.strict) : [],
        requirementNames: membership ? (membership.requirements || []).map(req => req.name) : [],
      });
    }
    if (member && member !== prevProps.member) {
      this.formRef && this.formRef.resetForm();
    }
  }

  public validate = async (form: Form) => {
    const { strictMap } = this.state;
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

     if (!prop) { // May just get a fieldset without any fields. If so, skip over it
       return requirements;
     }
      const { transform, validate, error } = requirementFields[prop]; // Transform, validate, then update
      let val: any = value;
      if (prop === "strict") {
        val = strictMap[index];
      }
      const transformedVal = transform ? transform(val) : val;
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

  private updateStrict = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    this.setState(state => {
      const map = state.strictMap.slice();
      map[index] = checked;
      return { strictMap: map };
    })
  }

  private updateRequirementName = (index: number) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value } = event.target;

    this.setState(state => {
      const reqNamesCopy = state.requirementNames.slice();
      const included = state.requirementNames[index];
      included ? reqNamesCopy.splice(index, 1, value) : reqNamesCopy[index] = value;
      return ({
        requirementNames: reqNamesCopy
      })
    })
  }

  private renderRequirementRow = (index: number) => {
    const { membership } = this.props;
    const { strictMap, requirementNames } = this.state;
    const fieldName = this.getRequirementName(index);
    const requirement = membership && membership.requirements && membership.requirements[index];
    const strict = strictMap[index] || false;

    const requirementName = requirementNames[index];
    const displayOther = requirementName !== undefined && (requirementName === RequirementNames.Other || !Object.values(RequirementNames).includes(requirementName));

    return (
      <Card>
        <CardContent>
          <Grid container spacing={24}>
            <Grid item xs={12}>
              <FormLabel>{requirementFields.name.label}</FormLabel>
              <Select
                fullWidth
                required
                value={displayOther ? RequirementNames.Other : requirementName}
                onChange={this.updateRequirementName(index)}
                disabled={requirement && !!requirement.name}
                name={`${fieldName}-${requirementFields.name.name}-select`}
                id={`${fieldName}-${requirementFields.name.name}-select`}
                placeholder={requirementFields.name.placeholder}
              >
                {Object.values(RequirementNames).map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
              </Select>
              {displayOther && <TextField
                fullWidth
                required
                value={requirementName}
                disabled={requirement && !!requirement.name}
                onChange={this.updateRequirementName(index)}
                label={requirementFields.name.label}
                name={`${fieldName}-${requirementFields.name.name}`}
                id={`${fieldName}-${requirementFields.name.name}`}
                placeholder={requirementFields.name.placeholder}
              />}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption">
                {`${requirementFields.rolloverLimit.label}: ${requirementFields.rolloverLimit.hint}`}
              </Typography>
              <TextField
                fullWidth
                value={requirement && requirement.rolloverLimit}
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
                value={requirement ? requirement.termLength : "1"}
                fullWidth
                native
                required
                placeholder={requirementFields.termLength.placeholder}
              >
                {range(1, 13).map(int => (
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
              <FormLabel component="legend">{requirementFields.targetCount.label}</FormLabel>
              <Select
                name={`${fieldName}-${requirementFields.targetCount.name}`}
                id={`${fieldName}-${requirementFields.targetCount.name}`}
                value={requirement ? requirement.targetCount : "1"}
                fullWidth
                native
                required
                placeholder={requirementFields.targetCount.placeholder}
              >
                {range(1, 11).map(int => (
                  <option
                    id={`${fieldName}-${requirementFields.targetCount.name}-option-${int}`}
                    key={`${fieldName}-${requirementFields.targetCount.name}-option-${int}`}
                    value={int}
                  >
                    {int}
                  </option>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption">
                {`${requirementFields.strict.label}: ${requirementFields.strict.hint}`}
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={strict}
                    value={`${fieldName}-${requirementFields.strict.name}`}
                    onChange={this.updateStrict(index)}
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
    const { membership } = this.props;

    const renderRemove = this.state.requirementCount > 1 &&
      (!membership || (membership.requirements || []).length < this.state.requirementCount)

      return (
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <FormLabel component="legend">{earnedMembershipFields.memberId.label}</FormLabel>
          <AsyncSelectFixed
            isClearable
            name={earnedMembershipFields.memberId.name}
            value={this.state.member}
            onChange={this.updateMemberValue}
            isDisabled={membership && !!membership.id}
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
              ...renderRemove ? [{
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
