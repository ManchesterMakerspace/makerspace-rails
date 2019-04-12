import * as React from "react";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import toNumber from "lodash-es/toNumber";

import FormModal from "ui/common/FormModal";
import ErrorMessage from "ui/common/ErrorMessage";
import { CollectionOf } from "app/interfaces";
import kebabCase from "lodash-es/kebabCase";
import Form from "ui/common/Form";
import KeyValueItem from "ui/common/KeyValueItem";
import { timeToDate } from "ui/utils/timeToDate";

export interface RenewForm {
  id: string;
  renew: number;
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

const formId = "renewal-form";
const renewalSelectName = `${formId}-renewal-length`;

class RenewalForm extends React.Component<OwnProps, {}> {
  private formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public validate = async (form: Form): Promise<RenewForm> => {
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
      validatedForm.renew = toNumber(renewalMonths);
    } else {
      errors[renewalSelectName] = "Select a renewal term."
    }

    await form.setFormState({
      errors,
    });

    return validatedForm as RenewForm;
  }

  private renderForm = (): JSX.Element => {
    const { entity, renewalOptions } = this.props;

    return (
      <>
        <Typography id={`${formId}-entity-name`} gutterBottom variant="subtitle1" align="center" color="primary">
          {entity.name}
        </Typography>
        <KeyValueItem label="Expiration" align="left">
          {entity.expiration ? timeToDate(entity.expiration) : "N/A"}
        </KeyValueItem>
        <KeyValueItem label="Renewal Term" align="left">
          <Select
            id="renewal-term"
            native
            required
            placeholder="Select an option"
            name={renewalSelectName}
          >
            {renewalOptions.map((option) => <option id={`renewal-option-${kebabCase(option.label)}`} key={kebabCase(option.label)} value={option.value}>{option.label}</option>)}
          </Select>
        </KeyValueItem>
      </>
    )
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, title, onSubmit, entity, error } = this.props;

    return (
      <FormModal
        formRef={this.setFormRef}
        id={formId}
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={title}
        onSubmit={onSubmit}
        submitText="Submit"
        error={error}
      >
        {entity ? this.renderForm() : (this.formRef && this.formRef.isDirty() && <ErrorMessage id={`${formId}-error`} error="Nothing to renew"/>)}
      </FormModal>
    );
  }
}

export default RenewalForm;
