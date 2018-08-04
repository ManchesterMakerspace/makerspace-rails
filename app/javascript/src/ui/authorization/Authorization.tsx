import * as React from "react";
import { TextField } from "@material-ui/core";
import isEmpty from "lodash-es/isEmpty";
import FormModal from "ui/page/FormModal";

interface OwnProps {
  isOpen: boolean;
  onClose: () => void;
}

interface State {}
interface Props extends OwnProps {}

class Authorization extends React.Component<Props, State> {
  private formRef;
  private setFormRef = ref => this.formRef = ref;

  private submit = (form) => {
    const values = form.getValues();
    const errors = {};
    if (!values["authEmail"]) {
      errors["authEmail"] = "Email is required";
    }
    form.setFormState({
      errors,
      // touched: mapValues(values, true);
    });
    if (!isEmpty(errors)) return;
  }

  public render(): JSX.Element {
    const { isOpen, onClose } = this.props;

    return (
      <FormModal
        formRef={this.setFormRef}
        id="sign-in"
        isOpen={isOpen}
        closeHandler={onClose}
        title="Please Sign In"
        onSubmit={this.submit}
        submitText="Sign In"
      >
        <TextField
          fullWidth
          required
          id="auth-email"
          label="Email"
          name="authEmail"
          placeholder="enter email"
          type="email"
        />
        <TextField
          fullWidth
          required
          id="auth-password"
          label="Password"
          name="authPassword"
          placeholder="enter password"
          type="password"
        />
      </FormModal>
    );
  }
}
export default Authorization;
