import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";

import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import { Routing } from "app/constants";
import { emailValid } from "app/utils";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { loginUserAction } from "ui/auth/actions";
import { LoginFields, loginPrefix } from "ui/auth/constants";
import { AuthForm } from "ui/auth/interfaces";
import ErrorMessage from "ui/common/ErrorMessage";
import Form from "ui/common/Form";
import FormModal from "ui/common/FormModal";
import { requestNewPassword } from "api/auth/transactions";

const formPrefix = "request-password-reset";
const passwordFields = {
  email: {
    label: "Email",
    name: `${formPrefix}-email`,
    placeholder: "Enter email address",
    error: "Invalid email",
    validate: (val: string) => emailValid(val)
  },
}

interface OwnProps {}
interface DispatchProps {
  loginUser: (authForm: AuthForm) => Promise<void>;
}
interface StateProps {
  isRequesting: boolean;
  error: string;
  auth: boolean;
}
interface State {
  redirect: string;
  requestingPassword: boolean;
  passwordError: string;
  openPassword: boolean;
  email: string;
}
interface Props extends OwnProps, DispatchProps, StateProps {}

class LoginForm extends React.Component<Props, State> {
  private formRef: Form;
  private passwordRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;
  private setPasswordRef = (ref: Form) => this.passwordRef = ref;

  constructor(props: Props) {
    super(props);
    this.state = {
      redirect: "",
      requestingPassword: false,
      openPassword: false,
      passwordError: "",
      email: ""
    }
  }

  public componentDidMount() {
    const { auth } = this.props;
    if (auth) {
      this.setState({ redirect: Routing.Members });
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;

    const { isRequesting, auth, error } = this.props;
    if (wasRequesting && !isRequesting && !error && auth) {
      this.setState({ redirect: Routing.Members });
    }
  }

  private submitLogin = async (form: Form) => {
    const validAuth: AuthForm = await form.simpleValidate<AuthForm>(LoginFields);

    if (!form.isValid()) return;

    this.props.loginUser(validAuth);
  }

  private submitPasswordRequest = async (form: Form) => {
    const { email } = await form.simpleValidate<AuthForm>(passwordFields);

    if (!form.isValid()) return;

    this.setState({ requestingPassword: true}, async () => {
      try {
        await requestNewPassword(email);
        this.setState({ requestingPassword: false, passwordError: "", email });
      } catch (e) {
        const { errorMessage } = e;
        this.setState({ requestingPassword: false, passwordError: errorMessage });
      }
    });
  }

  private renderPasswordReset = () => {
    const { requestingPassword, passwordError, openPassword, email } = this.state;

    return (
      <FormModal
        formRef={this.setPasswordRef}
        id={formPrefix}
        isOpen={openPassword}
        loading={requestingPassword}
        title="Request Password Reset"
        onSubmit={!email && this.submitPasswordRequest}
        submitText="Submit"
        cancelText={email ? "Close" : "Cancel"}
        closeHandler={this.closePasswordReset}
      >
        { email ? (
          <Typography>Instructions to reset your password have been sent to {email}</Typography>
          ) : (
            <Grid container spacing={16}>
              <Grid item xs={12}>
                <Typography variant="body1">Please enter the email address associated with your account to receive an email with instructions to reset your password.</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label={passwordFields.email.label}
                  name={passwordFields.email.name}
                  id={passwordFields.email.name}
                  placeholder={passwordFields.email.placeholder}
                  type="email"
                />
              </Grid>
            </Grid>
          )
        }

        {!requestingPassword && passwordError && <ErrorMessage id={`${formPrefix}-error`} error={passwordError}/>}
      </FormModal>
    )
  }

  private openPasswordReset = () => this.setState({ openPassword: true });
  private closePasswordReset = () => this.setState({ openPassword: false });

  public render(): JSX.Element {
    const { isRequesting, error } = this.props;
    const { redirect } = this.state;

    if (redirect) {
      return <Redirect to={Routing.Members} push={true} />
    }

    return (
      <>
        <Form
          ref={this.setFormRef}
          id={loginPrefix}
          loading={isRequesting}
          title="Please Sign In"
          onSubmit={this.submitLogin}
          submitText="Sign In"
        >
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                autoComplete="username"
                label={LoginFields.email.label}
                name={LoginFields.email.name}
                placeholder={LoginFields.email.placeholder}
                type="email"
              />
              <TextField
                fullWidth
                required
                autoComplete="current-password"
                label={LoginFields.password.label}
                name={LoginFields.password.name}
                placeholder={LoginFields.password.placeholder}
                type="password"
              />
            </Grid>
            <Grid item xs={12} style={{textAlign: "center"}}>
              <a id="forgot-password" href="#" onClick={this.openPasswordReset}>Forgot your password?</a>
            </Grid>
          </Grid>
          {this.formRef && this.formRef.isDirty() && !isRequesting && error && <ErrorMessage id={`${loginPrefix}-error`} error={error}/>}
        </Form>
        {this.renderPasswordReset()}
      </>
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
export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
