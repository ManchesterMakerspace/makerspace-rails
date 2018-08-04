import * as React from "react";
import { connect } from "react-redux";

import { TextField } from "@material-ui/core";
import isEmpty from "lodash-es/isEmpty";

import { CollectionOf } from "app/interfaces";
import { emailValid } from "app/utils";

import { StateProps as ReduxState } from "ui/reducer";
import FormModal from "ui/common/FormModal";
import { loginUserAction } from "ui/auth/actions";
import { fields } from "ui/auth/constants";
import { AuthForm } from "ui/auth/interfaces";
import ErrorMessage from "ui/common/ErrorMessage";

interface OwnProps {
  isOpen: boolean;
  onClose: () => void;
}
interface DispatchProps {
  loginUser: (authForm: AuthForm) => Promise<void>;
}
interface StateProps {
  isRequesting: boolean;
  error: string;
}
interface State {}
interface Props extends OwnProps, DispatchProps, StateProps {}

class Login extends React.Component<Props, State> {
  private formRef;
  private setFormRef = ref => this.formRef = ref;

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isRequesting, error, onClose } = this.props;
    
    // When login complete
    if (wasRequesting && !isRequesting && !error) {
      onClose();
    }
  }

  private validateForm = (form) => {
    const values = form.getValues();
    const errors: CollectionOf<string> = {};
    const validatedForm: AuthForm = {};

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

    return validatedForm;
  }

  private submit = async (form) => {
    let errors = {};
    let validAuth: AuthForm = {};
    
    try {
      validAuth = this.validateForm(form);
    } catch (e) {
      errors = {
        ...errors,
        ...e
      }
    }

    form.setFormState({
      errors,
    });

    if (!isEmpty(errors)) return;

    await this.props.loginUser(validAuth);
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error } = this.props;

    return (
      <FormModal
        formRef={this.setFormRef}
        id="sign-in"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title="Please Sign In"
        onSubmit={this.submit}
        submitText="Sign In"
      >
        <TextField
          fullWidth
          required
          label={fields.email.label}
          name={fields.email.name}
          placeholder={fields.email.placeholder}
          type="email"
        />
        <TextField
          fullWidth
          required
          label={fields.password.label}
          name={fields.password.name}
          placeholder={fields.password.placeholder}
          type="password"
        />
        { !isRequesting && error && <ErrorMessage error={error}/>}
      </FormModal>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const { isRequesting, error } = state.auth;

  return {
    isRequesting,
    error
  }
}

const mapDispatchToProps = (
  dispatch
): DispatchProps => {
  return {
    loginUser: (authForm) => dispatch(loginUserAction(authForm))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Login);
