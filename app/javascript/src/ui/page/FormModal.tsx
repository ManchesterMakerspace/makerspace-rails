import * as React from "react";
import { Dialog, DialogTitle, Button, DialogContent, DialogActions } from "@material-ui/core";

interface OwnProps {
  formRef: (ref: any) => any;
  id: string;
  isOpen: boolean;
  title: string;
  closeHandler: () => void;
  submitText: string;
  onSubmit: (form) => void;
}
interface FormModalProps extends OwnProps {}
interface State {}

class FormModal extends React.Component<FormModalProps, State> {

  private handleSubmit = (event) => {
    event.preventDefault();
    this.props.onSubmit(this);
  }

  public render(): JSX.Element {
    const { isOpen, closeHandler, submitText, title, children, id, formRef } = this.props;

    return (
      <Dialog
        aria-labelledby={`${id}-title`}
        open={isOpen}
        onClose={closeHandler}
      >
        <form onSubmit={this.handleSubmit} ref={formRef}>
          <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
          <DialogContent>
            {children}
          </DialogContent>

          <DialogActions>
            <Button variant="contained" color="primary" type="submit">{submitText}</Button>
            <Button variant="outlined" onClick={closeHandler}>Cancel</Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default FormModal;