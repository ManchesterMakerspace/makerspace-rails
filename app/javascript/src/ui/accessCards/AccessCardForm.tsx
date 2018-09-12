
import * as React from "react";
import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";

interface OwnProps {
  cardId: string;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}

class AccessCardForm extends React.Component<OwnProps,{}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit } = this.props;

    return (
      <FormModal
        formRef={this.setFormRef}
        id="card-form"
        loading={isRequesting}
        isOpen={isOpen}
        title={"IDK"}
        closeHandler={onClose}
        onSubmit={onSubmit}
        error={error}
      >
        Access Card Form
      </FormModal>
    )
  }
}

export default AccessCardForm;