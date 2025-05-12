import * as React from "react";
import kebabCase from "lodash-es/kebabCase";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import FormLabel from "@material-ui/core/FormLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { Member } from "makerspace-ts-api-client";

import FormModal from "ui/common/FormModal";
import { fields as memberFormField, MemberRoleOptions } from "ui/member/constants";
import Form from "ui/common/Form";
import { toDatePicker } from "ui/utils/timeToDate";
import { memberStatusLabelMap } from "./MemberStatusLabel";
import { states } from "./states";

interface OwnProps {
  member?: Member;
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
  subscription: boolean;
  silenceEmails: boolean;
}

class MemberForm extends React.Component<OwnProps, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: OwnProps) {
    super(props);
    this.state = {
      memberContractOnFile: false,
      subscription: false,
      silenceEmails: false,
    }
  }

  public componentDidMount() {
    const { member } = this.props;
    this.setState({ 
      memberContractOnFile: member && member.memberContractOnFile || false,
      subscription: member && member.subscription || false,
      silenceEmails: member && !!member.silenceEmails || false
    });
  }

  public componentDidUpdate(prevProps: OwnProps) {
    const { isOpen, member } = this.props;

    if ((isOpen && !prevProps.isOpen) || (member && member !== prevProps.member)) {
      this.setState({ 
        memberContractOnFile: member && member.memberContractOnFile || false,
        subscription: member && member.subscription || false,
        silenceEmails: member && !!member.silenceEmails || false
      });
      this.formRef && this.formRef.resetForm();
    }
  }

  public toggleContract = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.currentTarget;
    this.setState({ memberContractOnFile: checked });
  }

  public togglePaypal = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.currentTarget;
    this.setState({ subscription: checked });
  }

  public toggleEmailNotifications = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.currentTarget;
    this.setState({ silenceEmails: !checked });
  }

  public validate = async (form: Form): Promise<Member> => {
    const { isAdmin, member } = this.props;
    const { silenceEmails, memberContractOnFile, subscription } = this.state;
    const fields = memberFormField(isAdmin, member);
    const updatedMember = await form.simpleValidate<Member>(fields);
    return {
      ...updatedMember,
      silenceEmails,
      memberContractOnFile,
      subscription,
    };
  }

  private renderFormContents = () => {
    const { member = {} as Member, isAdmin } = this.props;
    const fields = memberFormField(isAdmin, member);

    return (<Grid container spacing={3}>
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
      <Grid item xs={12}>
        <TextField
          fullWidth
          value={member.phone}
          label={fields.phone.label}
          name={fields.phone.name}
          id={fields.phone.name}
          placeholder={fields.phone.placeholder}
          type="phone"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          required={!isAdmin}
          value={member.address && member.address.street}
          label={fields.street.label}
          name={fields.street.name}
          id={fields.street.name}
          placeholder={fields.street.placeholder}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          value={member.address && member.address.unit}
          label={fields.unit.label}
          name={fields.unit.name}
          id={fields.unit.name}
          placeholder={fields.unit.placeholder}
        />
      </Grid>
      <Grid item sm={12} md={5}>
        <TextField
          fullWidth
          required={!isAdmin}
          value={member.address && member.address.city}
          label={fields.city.label}
          name={fields.city.name}
          id={fields.city.name}
          placeholder={fields.city.placeholder}
        />
      </Grid>

      <Grid item sm={6} md={4}>
      <FormLabel component="legend">{fields.state.label}</FormLabel>
        <Select
          name={fields.state.name}
          value={member.address && member.address.state}
          fullWidth
          native
          required={!isAdmin}
          placeholder={fields.state.placeholder}
        >
          {[<option id={`${fields.state.name}-option-none`} key={"none"} value={""}>{fields.state.placeholder}</option>].concat(Object.keys(states).map(
            (key) => <option id={`${fields.state.name}-option-${kebabCase(key)}`} key={kebabCase(key)} value={key}>{key}</option>))}
        </Select>
      </Grid>

        <Grid item sm={6} md={3}>
        <TextField
          fullWidth
          required={!isAdmin}
          value={member.address && member.address.postalCode}
          label={fields.postalCode.label}
          name={fields.postalCode.name}
          id={fields.postalCode.name}
          placeholder={fields.postalCode.placeholder}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name={fields.silenceEmails.name}
              id={fields.silenceEmails.name}
              value={fields.silenceEmails.name}
              checked={!this.state.silenceEmails}
              onChange={this.toggleEmailNotifications}
              color="default"
            />
          }
          label={fields.silenceEmails.label}
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
              value={member.status || Object.keys(memberStatusLabelMap)[0]}
              fullWidth
              native
              required
              placeholder={fields.status.placeholder}
            >
              {Object.entries(memberStatusLabelMap).map(
                ([key, value]) => <option id={`${fields.status.name}-option-${kebabCase(key)}`} key={kebabCase(key)} value={key}>{value}</option>)}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <FormLabel component="legend">{fields.role.label}</FormLabel>
            <Select
              name={fields.role.name}
              value={member.role || Object.keys(MemberRoleOptions)[0]}
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
            <FormLabel component="legend">{fields.notes.label}</FormLabel>
            <TextField
              name={fields.notes.name}
              value={member.notes}
              fullWidth
              multiline
            />
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
          {member && (
             <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name={fields.subscription.name}
                    id={fields.subscription.name}
                    value={fields.subscription.name}
                    checked={this.state.subscription}
                    onChange={this.togglePaypal}
                    color="default"
                  />
                }
                label={fields.subscription.label}
              />
            </Grid>
          )}
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
