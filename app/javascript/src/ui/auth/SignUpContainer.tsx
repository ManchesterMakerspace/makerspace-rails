import * as React from "react";
import { connect } from "react-redux";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";

import { Invoice, InvoiceOptionSelection } from "app/entities/invoice";
import { Routing } from "app/constants";
import { CollectionOf } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import SignUpFormComponent from "ui/auth/SignUpForm";
import { SignUpForm, SignUpPayload } from "ui/auth/interfaces";
import { submitSignUpAction } from "ui/auth/actions";
import { AuthMember } from "ui/auth/interfaces";
import { Whitelists } from "app/constants";
import { createInvoiceAction } from "ui/invoices/actions";
import { Location } from "history";
import { push } from "connected-react-router";
const { billingEnabled } = Whitelists;

interface OwnProps { }
interface StateProps {
  stagedInvoices: CollectionOf<Invoice>;
  isRequesting: boolean;
  error: string;
  currentUser: AuthMember;
  location: Location
}
interface DispatchProps {
  submitSignUp: (signUpForm: SignUpPayload) => void;
  createInitialInvoice: (invoiceSelection: InvoiceOptionSelection) => void;
  goToLogin: () => void;
}
interface Props extends OwnProps, StateProps, DispatchProps { }
interface State {
  openLoginModal: boolean;
}
class SignUpContainer extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props);
    this.state = ({
      openLoginModal: false,
    });
  }

  private submitSignupForm = async (validSignUp: SignUpForm) => {
    const { membershipSelectionId, discountId, ...rest } = validSignUp;
    await this.props.submitSignUp(rest);
    if (membershipSelectionId) {
      await this.props.createInitialInvoice({ discountId, invoiceOptionId: membershipSelectionId });
    }
  }

  public render(): JSX.Element {
    const { isRequesting, error, location, goToLogin } = this.props;

    return (
      <Grid container justify="center" spacing={16}>
        <Grid item md={10} xs={12}>
          <Grid container justify="center" spacing={16}>
            <Grid item xs={12}>
              <Card style={{ minWidth: 275 }}>
                <CardContent>
                  <SignUpFormComponent
                    goToLogin={goToLogin}
                    onSubmit={this.submitSignupForm}
                    isRequesting={isRequesting}
                    error={error}
                    renderMembershipOptions={billingEnabled}
                    location={location}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Button id="auth-toggle" variant="outlined" color="secondary" fullWidth onClick={goToLogin}>
                Already a Member? Login
              </Button>
            </Grid>
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
  const { location } = state.router;

  return {
    currentUser,
    stagedInvoices,
    isRequesting,
    error,
    location
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    submitSignUp: (signUpForm) => dispatch(submitSignUpAction(signUpForm)),
    createInitialInvoice: (invoiceSelection) => dispatch(createInvoiceAction(invoiceSelection, false)),
    goToLogin: () => dispatch(push(Routing.Login)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUpContainer);