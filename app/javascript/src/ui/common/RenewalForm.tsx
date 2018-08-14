import * as React from "react";
import { Select } from "@material-ui/core";
import toNumber from "lodash-es/toNumber";

import FormModal from "ui/common/FormModal";
import ErrorMessage from "ui/common/ErrorMessage";
import { CollectionOf } from "app/interfaces";
import kebabCase from "lodash-es/kebabCase";

export interface RenewForm {
  id: string;
  term: number;
}
export interface RenewalEntity {
  id: string;
  name: string;
  expiration: number;
  renewalTerm?: number;
}
export interface SelectOption {
  label: string;
  value: string | number | string[];
}
interface OwnProps {
  entity: RenewalEntity;
  renewalOptions: SelectOption[];
  title: string;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: FormModal) => void;
}

const renewalSelectName = "renewal-form-renewal-length";

class RenewalForm extends React.Component<OwnProps, {}> {
  private formRef: FormModal;
  private setFormRef = (ref: FormModal) => this.formRef = ref;

  public validateRenewalForm = (form: FormModal): RenewForm => {
    const formValues = form.getValues();
    const errors: CollectionOf<string> = {};
    const validatedForm: Partial<RenewForm> = {};

    const { entity } = this.props;
    const renewalMonths = formValues[renewalSelectName];

    if (entity && entity.id) {
      validatedForm.id = entity.id;
    } else {
      errors[renewalSelectName] = "Nothing to renew"
    }

    if (renewalMonths) {
      validatedForm.term = toNumber(renewalMonths);
    } else {
      errors[renewalSelectName] = "Select a renewal term."
    }

    form.setFormState({
      errors,
    });

    return validatedForm as RenewForm;
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, title, onSubmit, entity, renewalOptions } = this.props;

    return (
      <FormModal
        ref={this.setFormRef}
        id="renewal-form"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={title}
        onSubmit={onSubmit}
        submitText="Submit"
      >
        <Select
          fullWidth
          native
          required
          placeholder="Select an option"
          name={renewalSelectName}
        >
          {renewalOptions.map((option) => <option key={kebabCase(option.label)} value={option.value}>{option.label}</option>)}
        </Select>
        {!entity && <ErrorMessage error="Nothing to renew" /> ||
          !isRequesting && error && <ErrorMessage error={error} />
        }
      </FormModal>
    );
  }
}

export default RenewalForm;
