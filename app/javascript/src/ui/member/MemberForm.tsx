import * as React from "react";
import kebabCase from "lodash-es/kebabCase";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import FormLabel from "@material-ui/core/FormLabel";

import { getGroups } from "api/groups/transactions";
import { Group } from "app/entities/group";

import { MemberDetails } from "app/entities/member";

import FormModal from "ui/common/FormModal";
import { fields as memberFormField, MemberStatusOptions, MemberRoleOptions } from "ui/member/constants";
import Form, { FormField } from "ui/common/Form";
import { toDatePicker, dateToTime } from "ui/utils/timeToDate";

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
}

interface State {
  groups: Group[];
  readingGroups: boolean;
  readGroupsError: string;
}

class MemberForm extends React.Component<OwnProps, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: OwnProps) {
    super(props);
    this.state = {
      groups: [],
      readingGroups: false,
      readGroupsError: ""
    }
  }

  public componentDidMount() {
    this.getGroups();
  }

  public componentDidUpdate(prevProps: OwnProps) {
    const { isOpen: wasOpen } = prevProps;
    const { isOpen } = this.props;
    if (isOpen && !wasOpen) {
      this.getGroups();
    }
  }

  private getGroups = async () => {
    if (this.state.readingGroups) { return; }
    try {
      this.setState({ readingGroups: true });
      const { data } = await getGroups();
      this.setState({ groups: data.groups, readGroupsError: "" });
    } catch (e) {
      const { errorMessage } = e;
      this.setState({ readGroupsError: errorMessage });
    }
  }

  public validate = async (form: Form): Promise<MemberDetails> => {
    const { isAdmin } = this.props;
    const fields = memberFormField(isAdmin);
    const details = await form.simpleValidate<MemberDetails>(fields);
    return {
      ...details,
      expirationTime: dateToTime(details.expirationTime)
    }
  }

  private renderFormContents = () => {
    const { member, isAdmin } = this.props;
    const { groups, readGroupsError } = this.state;
    const fields = memberFormField(isAdmin);
    const groupOptions = fields.groupName && Array.isArray(groups) && groups.map(
      group => <option id={`${fields.groupName.name}-option-${kebabCase(group.groupName)}`} key={kebabCase(group.groupName)} value={group.groupName}>{group.groupName}</option>).concat(
        [<option id={`${fields.groupName.name}-option-none`} key="none" value="">None</option>]
      )
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
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
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
            <FormLabel component="legend">{fields.groupName.label}</FormLabel>
            <Select
              name={fields.groupName.name}
              value={member.groupName}
              fullWidth
              native
              placeholder={fields.groupName.placeholder}
            >
              {readGroupsError || groupOptions}
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
        </>
      )}
      {/* TODO Permissions (Select) */}
    </Grid>)
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, member, isAdmin, title, noDialog } = this.props;
    const contents = this.renderFormContents();
    const formProps = {
      formRef: this.setFormRef,
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
      return <Form {...formProps}>{contents}</Form>;
    } else {
      return <FormModal {...formProps}>{contents}</FormModal>;
    }
  }
}

export default MemberForm;
