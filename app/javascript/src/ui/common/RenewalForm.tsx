import * as React from "react";
import { Select, Typography } from "@material-ui/core";
import toNumber from "lodash-es/toNumber";

import FormModal from "ui/common/FormModal";
import ErrorMessage from "ui/common/ErrorMessage";
import { CollectionOf } from "app/interfaces";
import kebabCase from "lodash-es/kebabCase";
import Form from "ui/common/Form";
import { timeToDate } from "ui/utils/timeToDate";

export interface RenewForm {
  id: string;
  renewal: number;
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
  onSubmit: (form: Form) => void;
}

const renewalSelectName = "renewal-form-renewal-length";

class RenewalForm extends React.Component<OwnProps, {}> {
  private formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public validateRenewalForm = async (form: Form): Promise<RenewForm> => {
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
      validatedForm.renewal = toNumber(renewalMonths);
    } else {
      errors[renewalSelectName] = "Select a renewal term."
    }

    await form.setFormState({
      errors,
    });

    return validatedForm as RenewForm;
  }

  private renderForm = (): JSX.Element => {
    const { isRequesting, error, entity, renewalOptions } = this.props;

    return (
      <>
       <Typography gutterBottom variant="subheading" align="center" color="primary">
          {entity.name}
        </Typography>
        <Typography gutterBottom align="left">
          <strong>Expiration:</strong> {timeToDate(entity.expiration)}
        </Typography>
        <Select
          fullWidth
          native
          required
          placeholder="Select an option"
          name={renewalSelectName}
        >
          {renewalOptions.map((option) => <option key={kebabCase(option.label)} value={option.value}>{option.label}</option>)}
        </Select>
      </>
    )
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, title, onSubmit, entity, error } = this.props;

    return (
      <FormModal
        formRef={this.setFormRef}
        id="renewal-form"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={title}
        onSubmit={onSubmit}
        submitText="Submit"
        error={error}
      >
        {entity ? this.renderForm() :  <ErrorMessage error="Nothing to renew"/>}
      </FormModal>
    );
  }
}

export default RenewalForm;
