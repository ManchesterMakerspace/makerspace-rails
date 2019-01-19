import * as React from "react";
import Typography from "@material-ui/core/Typography";

import { Rental } from "app/entities/rental";
import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import Form from "ui/common/Form";

interface OwnProps {
  rental: Partial<Rental>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}


class DeleteRentalModal extends React.Component<OwnProps, {}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, rental } = this.props;

    return rental ? (
      <FormModal
        formRef={this.setFormRef}
        id="delete-rental"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title="Delete Rental"
        onSubmit={onSubmit}
        submitText="Delete"
        error={error}
      >
        <Typography gutterBottom>
          Are you sure you want to delete this rental?
        </Typography>
        <KeyValueItem label="Contact">
          <span id="delete-rental-member">{rental.memberName}</span>
        </KeyValueItem>
        <KeyValueItem label="Number">
          <span id="delete-rental-number">{rental.number}</span>
        </KeyValueItem>
        <KeyValueItem label="Description">
          <span id="delete-rental-description">{rental.description}</span>
        </KeyValueItem>
      </FormModal>
    ) : null;
  }
}

export default DeleteRentalModal;
