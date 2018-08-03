import * as React from "react";
import { TextField } from "@material-ui/core";
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
    console.log(form)
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
          id="auth-email"
          label="Email"
          name="authEmail"
          placeholder="enter email"
          type="email"
        />
        <TextField
          fullWidth
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
