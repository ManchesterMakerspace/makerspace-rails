import * as React from "react";
import { TextField } from "@material-ui/core";
import isEmpty from "lodash-es/isEmpty";
import mapValues from "lodash-es/mapValues";

import { CollectionOf } from "app/interfaces";
import { emailValid } from "app/utils";

import { postLogin } from "api/auth/transactions";

import { loginUserAction as loginUser } from "ui/auth/actions";
import { fields } from "ui/auth/constants";
import FormModal from "ui/page/FormModal";
import { AuthForm } from "ui/auth/interfaces";

interface OwnProps {
  isOpen: boolean;
  onClose: () => void;
}

interface State {}
interface Props extends OwnProps {}

class Login extends React.Component<Props, State> {
  private formRef;
  private setFormRef = ref => this.formRef = ref;

  public componentDidMount() {
    postLogin();
  }

  private validateForm = (form) => {
    const values = form.getValues();
    const errors: CollectionOf<string> = {};
    const validatedForm: Partial<AuthForm> = {};

    const email = values[fields.email.name];
    if (email && emailValid(email)) {
      validatedForm.email = email;
    } else {
      errors[fields.email.name] = "Invalid email";
    }

    const password = values[fields.password.name];
    if (password) {
      validatedForm.password = password;
    } else {
      errors[fields.password.name] = "Invalid password";
    }

    if (Object.keys(errors).length) {
      throw errors;
    }

    return validatedForm as AuthForm;
  }

  private submit = async (form) => {
    let errors = {};
    let validAuth = {};
    try {
      validAuth = this.validateForm(form);
    } catch (e) {
      errors = {
        ...errors,
        ...e
      }
    }
    const values = form.getValues();

    form.setFormState({
      errors,
      touched: mapValues(values, () => true)
    });

    if (!isEmpty(errors)) return;

    await loginUser(validAuth);
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
          id={fields.email.id}
          label={fields.email.label}
          name={fields.email.name}
          placeholder={fields.email.placeholder}
          type="email"
        />
        <TextField
          fullWidth
          required
          id={fields.password.id}
          label={fields.password.label}
          name={fields.password.name}
          placeholder={fields.password.placeholder}
          type="password"
        />
      </FormModal>
    );
  }
}
export default Login;
