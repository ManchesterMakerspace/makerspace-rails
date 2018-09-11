import * as React from "react";
import { Grid, TextField } from "@material-ui/core";

import { MemberDetails } from "app/entities/member";
import { CollectionOf } from "app/interfaces";

import FormModal from "ui/common/FormModal";
import { fields } from "ui/member/constants";
import Form from "ui/common/Form";

interface OwnProps {
  member: MemberDetails;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}

class MemberForm extends React.Component<OwnProps, {}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public validate = async (form: Form): Promise<MemberDetails> => {
    const formValues = form.getValues();
    const errors: CollectionOf<string> = {};
    const validatedMember: Partial<MemberDetails> = {};

    Object.entries(fields).forEach(([key, field]) => {
      const formVal = formValues[field.name];
      if (field.validate(formVal)) {
        validatedMember[key] = formVal
      } else {
        errors[field.name] = field.error;
      }
    });

    await form.setFormState({
      errors,
    });

    return validatedMember as MemberDetails;
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, member } = this.props;

    return (
      <FormModal
        formRef={this.setFormRef}
        id="member-form"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={`Edit ${member ? `${member.firstname} ${member.lastname}` : "Member"}`}
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
              placeholder={fields.lastname.placeholder}
            />
          </Grid>
        </Grid>
        Expiration (Date Picker)
        <TextField
          fullWidth
          required
          value={member.email}
          label={fields.email.label}
          name={fields.email.name}
          placeholder={fields.email.placeholder}
          type="email"
        />
        Status (Select)
        Permissions (Select)
      </FormModal>
    )
  }
}

export default MemberForm;
