import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";

import { Invoice } from "app/entities/invoice";
import { Routing } from "app/constants";
import { CollectionOf } from "app/interfaces";

import { uploadMemberSignature } from "api/members/transactions";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import SignUpFormComponent from "ui/auth/SignUpForm";
import SignDocuments from "ui/auth/SignDocuments";
import { SignUpForm } from "ui/auth/interfaces";
import { submitSignUpAction } from "ui/auth/actions";
import { AuthMember } from "ui/auth/interfaces";

interface OwnProps { }
interface StateProps {
  stagedInvoices: CollectionOf<Invoice>;
  isRequesting: boolean;
  error: string;
  currentUser: AuthMember;
}
interface DispatchProps {
  submitSignUp: (signUpForm: SignUpForm) => void;
}
interface Props extends OwnProps, StateProps, DispatchProps { }
interface State {
  openLoginModal: boolean;
  displayDocuments: boolean;
  redirect: string;
  signUpForm: SignUpForm;
  signature: WindowBase64;
  signatureUploadError: string;
  signatureUploading: boolean;
}
class SignUpContainer extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props);
    this.state = ({
      openLoginModal: false,
      redirect: undefined,
      displayDocuments: false,
      signUpForm: undefined,
      signature: undefined,
      signatureUploadError: "",
      signatureUploading: false,
    });
  }

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isRequesting, error } = this.props;
    // Display checkout after sign up request completes
    if (wasRequesting && !isRequesting && !error) {
      this.submitSignature();
      this.goToCheckout();
    }
  }

  // Option to redirect to login if they try to sign up w/ an existing email
  private goToLogin = () => {
    this.setState({ redirect: Routing.Login });
  }

  private goToCheckout = async () => {
    this.setState({ redirect: Routing.Checkout });
  }

  // Save sign up form & display documents
  private goToDocuments = (validSignUp: SignUpForm) => {
    this.setState({ displayDocuments: true, signUpForm: validSignUp });
  }

  // Upload signature, but don't block member from completing payment
  // If signature upload fails for some reason, we'll get a Slack notification about it
  private submitSignature = async () => {
    try {
      this.setState({ signatureUploading: true });
      await uploadMemberSignature(this.props.currentUser && this.props.currentUser.id, this.state.signature);
      this.setState({ signatureUploading: false, signatureUploadError: "" });
    } catch (e) {
      this.setState({ signatureUploading: false, signatureUploadError: e });
    }
  }
  // Save signature for later & submit sign up form
  private submitSignupForm = (signature: WindowBase64) => {
    this.setState({ signature });
    this.props.submitSignUp(this.state.signUpForm);
  }

  public render(): JSX.Element {
    const { redirect, displayDocuments, signatureUploadError, signatureUploading } = this.state;
    const { isRequesting, error, currentUser  } = this.props;
    if (redirect) {
      return <Redirect to={redirect} />
    }

    return (
      <Grid container justify="center" spacing={16}>
        <Grid item md={6} xs={12}>
          <Grid container justify="center" spacing={16}>
            <Grid item xs={12}>
              <Card style={{ minWidth: 275 }}>
                <CardContent>
                  {displayDocuments ?
                    <SignDocuments currentUser={currentUser} uploadProcessing={signatureUploading} uploadError={signatureUploadError} onSubmit={this.submitSignupForm} />
                    : (
                      <>
                        <SignUpFormComponent
                          goToLogin={this.goToLogin}
                          onSubmit={this.goToDocuments}
                          isRequesting={isRequesting}
                          error={error}
                          renderMembershipOptions={true}
                        />
                      </>
                    )
                  }
                </CardContent>
              </Card>
            </Grid>
            {!displayDocuments && <Grid item xs={12}>
              <Button id="auth-toggle" variant="outlined" color="secondary" fullWidth onClick={this.goToLogin}>
                Already a Member? Login
              </Button>
            </Grid>}
          </Grid>
        </Grid>
      </Grid>
    )
  }
}
const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const {
    invoices: stagedInvoices
  } = state.checkout;
  const {
    currentUser,
    isRequesting,
    error
  } = state.auth;

  return {
    currentUser,
    stagedInvoices,
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

export default connect(mapStateToProps, mapDispatchToProps)(SignUpContainer);