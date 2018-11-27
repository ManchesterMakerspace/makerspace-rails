import * as React from "react";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router";

import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import RemoveRedEye from "@material-ui/icons/RemoveRedEye";
import MembershipSelectForm from "ui/auth/MembershipSelectForm";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SignUpFields, EmailExistsError, signUpPrefix } from "ui/auth/constants";
import { SignUpForm } from "ui/auth/interfaces";
import { submitSignUpAction } from "ui/auth/actions";
import ErrorMessage from "ui/common/ErrorMessage";
import Form from "ui/common/Form";
import { getHistory } from "app/utils";

interface OwnProps extends RouteComponentProps<any>{
  goToLogin: () => void;
  renderMembershipOptions?: boolean;
  onSubmit?: () => void;
}
interface DispatchProps {
  submitSignUp: (signUpForm: SignUpForm) => void;
}
interface StateProps {
  memberId: string;
  isRequesting: boolean;
  error: string;
}
interface State {
  membershipSelectionId: string;
  membershipSelectionError: string;
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
      membershipSelectionError: "",
      membershipSelectionId: props.location.state && props.location.state.membershipOptionId
    };
    // Clear history after reading state
    getHistory().replace({ ...props.location, state: undefined });
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isRequesting, error } = this.props;

    if (wasRequesting && !isRequesting) {
      if (error === EmailExistsError) {
        this.setState({ emailExists: true });
      }
      if (!error) {
        this.props.onSubmit && this.props.onSubmit();
      }
    }
    if (this.state.membershipSelectionId !== prevState.membershipSelectionId) {
      this.setState({ membershipSelectionError: "" });
    }
  }

  private togglePasswordMask = () => {
    this.setState((state) => ({ passwordMask: !state.passwordMask }));
  }

  private renderPasswordInput = (): JSX.Element => {
    const { passwordMask } = this.state;

    return (
      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label={SignUpFields.password.label}
          name={SignUpFields.password.name}
          id={SignUpFields.password.name}
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
      </Grid>
    )
  }

  private submit = async (form: Form) => {
    const validSignUp: SignUpForm = await form.simpleValidate<SignUpForm>(SignUpFields);

    if (!form.isValid()) return;

    if (this.props.renderMembershipOptions && !this.state.membershipSelectionId) {
      this.setState({ membershipSelectionError: SignUpFields.membershipId.error })
      return;
    }

    this.props.submitSignUp({
      ...validSignUp,
      membershipSelectionId: this.state.membershipSelectionId,
      discount: !!validSignUp.discount
    });
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

  private updateMembershipSelection = (membershipSelectionId: string) => {
    this.setState({ membershipSelectionId });
  }

  public render(): JSX.Element {
    const { isRequesting, error } = this.props;
    const { emailExists, membershipSelectionError, membershipSelectionId } = this.state;

    return (
      <Form
        ref={this.setFormRef}
        id={signUpPrefix}
        loading={isRequesting}
        title="Create an Account"
        onSubmit={this.submit}
        submitText="Sign Up"
      >
        <Grid container spacing={16}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              label={SignUpFields.firstname.label}
              name={SignUpFields.firstname.name}
              id={SignUpFields.firstname.name}
              placeholder={SignUpFields.firstname.placeholder}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              label={SignUpFields.lastname.label}
              name={SignUpFields.lastname.name}
              id={SignUpFields.lastname.name}
              placeholder={SignUpFields.lastname.placeholder}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label={SignUpFields.email.label}
              name={SignUpFields.email.name}
              id={SignUpFields.email.name}
              placeholder={SignUpFields.email.placeholder}
              type="email"
            />
          </Grid>
          <Grid item xs={12}>
            {this.renderPasswordInput()}
          </Grid>
          {this.props.renderMembershipOptions && (
            <Grid item xs={12}>
              <MembershipSelectForm membershipOptionId={membershipSelectionId} onSelect={this.updateMembershipSelection}/>
              {membershipSelectionError && <ErrorMessage error={membershipSelectionError}/>}
            </Grid>
          )}
          {!isRequesting && error && <ErrorMessage id={`${signUpPrefix}-error`} error={error} />}
        </Grid>

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
    currentUser: {
      id: memberId,
    },
    isRequesting,
    error
  } = state.auth;

  return {
    memberId,
    isRequesting,
    error
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    submitSignUp: (signUpForm) => dispatch(submitSignUpAction(signUpForm)),
  };
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SignUpFormComponent));
