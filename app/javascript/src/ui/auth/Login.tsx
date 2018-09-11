import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";

import { TextField } from "@material-ui/core";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
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
  auth: boolean;
}
interface State {
  redirect: boolean;
}
interface Props extends OwnProps, DispatchProps, StateProps {}

class Login extends React.Component<Props, State> {
  private formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  constructor(props: Props) {
    super(props);
    this.state = {
      redirect: false,
    }
  }

  public componentDidMount() {
    const { auth } = this.props;
    if (auth) {
      this.setState({ redirect: true });
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;

    const { isRequesting, auth, error } = this.props;
    if (wasRequesting && !isRequesting && !error && auth) {
      this.setState({ redirect: true });
    }
  }

  private submit = async (form: Form) => {
    const validAuth: AuthForm = await form.simpleValidate<AuthForm>(LoginFields);

    if (!form.isValid()) return;

    await this.props.loginUser(validAuth);
  }

  public render(): JSX.Element {
    const { isRequesting, error } = this.props;
    const { redirect } = this.state;

    if (redirect) {
      return <Redirect to="/members" push={true} />
    }

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
  const { currentUser, isRequesting, error } = state.auth;

  return {
    isRequesting,
    error,
    auth: currentUser && !!currentUser.email,
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
