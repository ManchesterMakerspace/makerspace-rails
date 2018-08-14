import * as React from "react";
import { connect } from "react-redux";

import { TextField } from "@material-ui/core";
import isEmpty from "lodash-es/isEmpty";

import { CollectionOf } from "app/interfaces";
import { emailValid } from "app/utils";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import FormModal from "ui/common/FormModal";
import { loginUserAction } from "ui/auth/actions";
import { LoginFields } from "ui/auth/constants";
import { AuthForm } from "ui/auth/interfaces";
import ErrorMessage from "ui/common/ErrorMessage";
import Form from "ui/common/Form";

interface OwnProps {
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
  private formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  private validateForm = (form: Form): AuthForm => {
    const values = form.getValues();
    const errors: CollectionOf<string> = {};
    const validatedForm: Partial<AuthForm> = {};

    Object.entries(LoginFields).forEach(([key, field]) => {
      const value = values[field.name];
      if (field.validate(value)) {
        validatedForm[key] = value;
      } else {
        errors[field.name] = value;
      }
    });

    form.setFormState({
      errors,
    });

    return validatedForm as AuthForm;
  }

  private submit = async (form: Form) => {
    const validAuth: AuthForm = this.validateForm(form);

    if (!form.isValid()) return;

    await this.props.loginUser(validAuth);
  }

  public render(): JSX.Element {
    const { isRequesting, error } = this.props;

    return (
      <Form
        ref={this.setFormRef}
        id="sign-in"
        loading={isRequesting}
        title="Please Sign In"
        onSubmit={this.submit}
        submitText="Sign In"
      >
        <TextField
          fullWidth
          required
          label={LoginFields.email.label}
          name={LoginFields.email.name}
          placeholder={LoginFields.email.placeholder}
          type="email"
        />
        <TextField
          fullWidth
          required
          label={LoginFields.password.label}
          name={LoginFields.password.name}
          placeholder={LoginFields.password.placeholder}
          type="password"
        />
        { !isRequesting && error && <ErrorMessage error={error}/>}
      </Form>
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
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    loginUser: (authForm) => dispatch(loginUserAction(authForm))
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(Login);
