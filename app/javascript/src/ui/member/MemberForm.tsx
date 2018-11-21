import * as React from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

import { MemberDetails } from "app/entities/member";

import FormModal from "ui/common/FormModal";
import { fields } from "ui/member/constants";
import Form from "ui/common/Form";
import { toDatePicker, dateToTime } from "ui/utils/timeToDate";

interface OwnProps {
  member: MemberDetails;
  isAdmin: boolean;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}

class MemberForm extends React.Component<OwnProps, {}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public validate = async (_form: Form): Promise<MemberDetails> => {
    const details = await this.formRef.simpleValidate<MemberDetails>(fields);
    return {
      ...details,
      expirationTime: dateToTime(details.expirationTime)
    }
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, member, isAdmin } = this.props;

    return (
      <FormModal
        formRef={this.setFormRef}
        id="member-form"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={`Update ${member ? `${member.firstname} ${member.lastname}` : "Member"}`}
        onSubmit={onSubmit}
        submitText="Save"
        error={error}
      >
        <Grid container spacing={24}>
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
        </Grid>
        {isAdmin && <TextField
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
        />}
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
        {/* Status (Select) */}
        {/* Permissions (Select) */}
      </FormModal>
    )
  }
}

export default MemberForm;
