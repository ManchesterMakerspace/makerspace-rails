import * as React from "react";
import kebabCase from "lodash-es/kebabCase";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import FormLabel from "@material-ui/core/FormLabel";
import MenuItem from "@material-ui/core/MenuItem";
import { Checkbox, FormControlLabel } from "@material-ui/core";

import { MemberDetails } from "app/entities/member";

import FormModal from "ui/common/FormModal";
import { fields as memberFormField, MemberStatusOptions, MemberRoleOptions } from "ui/member/constants";
import Form from "ui/common/Form";
import { toDatePicker } from "ui/utils/timeToDate";

interface OwnProps {
  member: Partial<MemberDetails>;
  isAdmin: boolean;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
  title?: string;
  noDialog?: boolean;
  ref?: any;
}

interface State {
  memberContractOnFile: boolean;
}

class MemberForm extends React.Component<OwnProps, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: OwnProps) {
    super(props);
    this.state = {
      memberContractOnFile: false,
    }
  }

  public componentDidUpdate(prevProps: OwnProps) {
    const { isOpen, member } = this.props;
    if (isOpen && !prevProps.isOpen) {
      this.setState({ memberContractOnFile: member && member.memberContractOnFile || false });
    }
    if (member && member !== prevProps.member) {
      this.formRef && this.formRef.resetForm();
    }
  }

  public toggleContract = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.currentTarget;
    this.setState({ memberContractOnFile: checked });
  }

  public validate = async (form: Form): Promise<MemberDetails> => {
    const { isAdmin, member } = this.props;
    const fields = memberFormField(isAdmin, member);
    return (await form.simpleValidate<MemberDetails>(fields));
  }

  private renderFormContents = () => {
    const { member, isAdmin } = this.props;
    const fields = memberFormField(isAdmin, member);

    return (<Grid container spacing={24}>
      <Grid item xs={6}>
        <TextField
          fullWidth
          required
          value={member.firstname}
          label={fields.firstname.label}
          name={fields.firstname.name}
          id={fields.firstname.name}
          placeholder={fields.firstname.placeholder}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          required
          value={member.lastname}
          label={fields.lastname.label}
          name={fields.lastname.name}
          id={fields.lastname.name}
          placeholder={fields.lastname.placeholder}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          value={member.email}
          label={fields.email.label}
          name={fields.email.name}
          id={fields.email.name}
          placeholder={fields.email.placeholder}
          type="email"
        />
      </Grid>
      {isAdmin && (
        <>
          {fields.expirationTime && ( // Dont display expiration for creation
            <Grid item xs={12}>
              <TextField
                fullWidth
                value={toDatePicker(member.expirationTime)}
                label={fields.expirationTime.label}
                name={fields.expirationTime.name}
                placeholder={fields.expirationTime.placeholder}
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <FormLabel component="legend">{fields.status.label}</FormLabel>
            <Select
              name={fields.status.name}
              value={member.status}
              fullWidth
              native
              required
              placeholder={fields.status.placeholder}
            >
              {Object.entries(MemberStatusOptions).map(
                ([key, value]) => <option id={`${fields.status.name}-option-${kebabCase(key)}`} key={kebabCase(key)} value={key}>{value}</option>)}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <FormLabel component="legend">{fields.role.label}</FormLabel>
            <Select
              name={fields.role.name}
              value={member.role}
              fullWidth
              native
              required
              placeholder={fields.role.placeholder}
            >
              {Object.entries(MemberRoleOptions).map(
                ([key, value]) => <option id={`${fields.role.name}-option-${kebabCase(key)}`} key={kebabCase(key)} value={key}>{value}</option>)}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  required={!(member && member.id)}
                  name={fields.memberContractOnFile.name}
                  id={fields.memberContractOnFile.name}
                  value={fields.memberContractOnFile.name}
                  checked={this.state.memberContractOnFile}
                  onChange={this.toggleContract}
                  color="default"
                />
              }
              label={fields.memberContractOnFile.label}
            />
          </Grid>
        </>
      )}
      {/* TODO Permissions (Select) */}
    </Grid>)
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, member, isAdmin, title, noDialog } = this.props;
    const contents = this.renderFormContents();
    const formProps = {
      id: "member-form",
      loading: isRequesting,
      isOpen,
      closeHandler: onClose,
      title: title ? title : `Update ${member ? `${member.firstname} ${member.lastname}` : "Member"}`,
      onSubmit,
      submitText: "Save",
      error,
    }

    if (noDialog) {
      return <Form ref={this.setFormRef} {...formProps}>{contents}</Form>;
    } else {
      return <FormModal formRef={this.setFormRef} {...formProps}>{contents}</FormModal>;
    }
  }
}

export default MemberForm;
