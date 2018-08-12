import * as React from "react";
import isEmpty from "lodash-es/isEmpty";

import { MemberDetails } from "app/entities/member";
import { CollectionOf } from "app/interfaces";

import FormModal from "ui/common/FormModal";
import ErrorMessage from "ui/common/ErrorMessage";
import { fields } from "ui/member/constants";

interface OwnProps {
  member: MemberDetails;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (validMember: MemberDetails) => void;
}

class MemberForm extends React.Component<OwnProps, {}> {
  private formRef: FormModal;
  private setFormRef = (ref: FormModal) => this.formRef = ref;

  private validate = (): Partial<MemberDetails> => {
    const formValues = this.formRef.getValues();
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

    if (Object.keys(errors)) {
      throw errors;
    }

    return validatedMember;
  }

  private submit = async (form: FormModal) => {
    let errors = {};
    let validMember: MemberDetails;

    try {
      const validatedForm = this.validate();
      validMember = Object.assign({}, this.props.member, validatedForm);
    } catch (e) {
      errors = {
        ...errors,
        ...e
      }
    }

    form.setFormState({
      errors,
    });

    if (!isEmpty(errors)) return;

    this.props.onSubmit(validMember);
  }


  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error } = this.props;

    return (
      <FormModal
        ref={this.setFormRef}
        id="member-form"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title="Edit Member"
        onSubmit={this.submit}
        submitText="Save"
      >
        First & Last Name
        Expiration (Date Picker)
        Email
        Status (Select)
        Permissions (Select)
        {!isRequesting && error && <ErrorMessage error={error} />}
      </FormModal>
    )
  }
}

export default MemberForm;
