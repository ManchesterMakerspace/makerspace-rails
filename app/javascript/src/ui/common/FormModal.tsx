import * as React from "react";
import Dialog from "@material-ui/core/Dialog";

import Form from "ui/common/Form";

interface FormModalProps {
  formRef: (ref: Form) => Form;
  id: string;
  isOpen: boolean;
  title: string;
  closeHandler?: () => void;
  cancelText?: string;
  onSubmit?: (form: Form) => void;
  submitText?: string;
  loading?: boolean;
  children?: React.ReactNode;
  error?: string;
  style?: { [key: string]: string }
}

const FormModal: React.SFC<FormModalProps> = (props: FormModalProps) => {
  const { formRef, isOpen, id, loading, title, closeHandler, cancelText,
    submitText, onSubmit, children, error, style } = props;

  return (
    <Dialog
      fullWidth={true}
      aria-labelledby={`${id}-title`}
      open={isOpen}
      onClose={closeHandler}
      disableBackdropClick={true}
    >
      <Form
        ref={formRef}
        id={id}
        title={title}
        onCancel={closeHandler}
        cancelText={cancelText}
        loading={loading}
        onSubmit={onSubmit}
        submitText={submitText}
        error={error}
        style={style}
      >
        {children}
      </Form>
    </Dialog>
  );
}

export default FormModal;