import * as React from "react";
import { connect } from "react-redux";

import { TextField, Grid, InputAdornment, Card, CardContent } from "@material-ui/core";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SignUpFields, EmailExistsError } from "ui/auth/constants";
import { SignUpForm } from "ui/auth/interfaces";
import ErrorMessage from "ui/common/ErrorMessage";
import { submitSignUpAction } from "ui/auth/actions";
import { RemoveRedEye } from "@material-ui/icons";
import Form from "ui/common/Form";
import { Redirect } from "react-router";

interface OwnProps {
  goToLogin: () => void;
}
interface DispatchProps {
  submitSignUp: (signUpForm: SignUpForm) => void;
}
interface StateProps {
  signUpComplete: boolean;
  isRequesting: boolean;
  error: string;
}
interface State {
  passwordMask: boolean;
  emailExists: boolean;
}
interface Props extends OwnProps, DispatchProps, StateProps { }

class SignUpFormComponent extends React.Component<Props, State> {
  private formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  constructor(props: Props) {
    super(props);
    this.state = {
      passwordMask: true,
      emailExists: false,
    };
  }

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isRequesting, error } = this.props;

    if (wasRequesting && !isRequesting && error === EmailExistsError) {
      this.setState({ emailExists: true });
    }
  }

  private togglePasswordMask = () => {
    this.setState((state) => ({ passwordMask: !state.passwordMask }));
  }

  private renderPasswordInput = (): JSX.Element => {
    const { passwordMask } = this.state;

    return (
      <TextField
        fullWidth
        required
        label={SignUpFields.password.label}
        name={SignUpFields.password.name}
        placeholder={SignUpFields.password.placeholder}
        type={passwordMask ? 'password' : 'text'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <RemoveRedEye style={{cursor: 'pointer'}} onClick={this.togglePasswordMask} />
            </InputAdornment>
          ),
        }}
      />
    )
  }

  private submit = async (form: Form) => {
    const validSignUp: SignUpForm = await form.simpleValidate<SignUpForm>(SignUpFields);

    if (!form.isValid()) return;

    await this.props.submitSignUp(validSignUp);
  }

  private closeNotification = () => {
    this.setState({ emailExists: false });
  }

  private renderEmailNotification = (): JSX.Element => {
    const { goToLogin } = this.props;

    return (
      <Card style={{minWidth: 275}}>
        <CardContent>
          <Form
            id="email-exists"
            title="Email already exists"
            onSubmit={goToLogin}
            submitText="Login"
            onCancel={this.closeNotification}
            cancelText="Cancel"
          >
            An account with this email already exists.  Please login to continue.
          </Form>
        </CardContent>
      </Card>

    )
  }

  public render(): JSX.Element {
    const { isRequesting, error, signUpComplete } = this.props;
    const { emailExists } = this.state;

    if (signUpComplete) {
      return <Redirect to="/checkout"/>
    }

    return (
      <Form
        ref={this.setFormRef}
        id="sign-up"
        loading={isRequesting}
        title="Become a Member"
        onSubmit={this.submit}
        submitText="Sign Up"
      >
        <Grid container spacing={24}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              label={SignUpFields.firstname.label}
              name={SignUpFields.firstname.name}
              placeholder={SignUpFields.firstname.placeholder}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              label={SignUpFields.lastname.label}
              name={SignUpFields.lastname.name}
              placeholder={SignUpFields.lastname.placeholder}
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          required
          label={SignUpFields.email.label}
          name={SignUpFields.email.name}
          placeholder={SignUpFields.email.placeholder}
          type="email"
        />
        {this.renderPasswordInput()}
        {!isRequesting && error && <ErrorMessage error={error} />}

        {emailExists && this.renderEmailNotification()}
      </Form>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const {
    newUser: {
      email
    },
    isRequesting,
    error
  } = state.auth;

  const signUpComplete = !error && !!email

  return {
    signUpComplete,
    isRequesting,
    error
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    submitSignUp: (signUpForm) => dispatch(submitSignUpAction(signUpForm))
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SignUpFormComponent);
