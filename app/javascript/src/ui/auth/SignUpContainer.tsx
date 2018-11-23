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

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import SignUpForm from "ui/auth/SignUpForm";
import SignDocuments from "ui/auth/SignDocuments";
import Form from "ui/common/Form";

interface OwnProps { }
interface StateProps {
  stagedInvoices: CollectionOf<Invoice>;
}
interface DispatchProps {
}
interface Props extends OwnProps, StateProps, DispatchProps { }
interface State {
  openLoginModal: boolean;
  displayDocuments: boolean;
  redirect: string;
}
class SignUpContainer extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props);
    this.state = ({
      openLoginModal: false,
      redirect: undefined,
      displayDocuments: false,
    });
  }

  private goToLogin = () => {
    this.setState({ redirect: Routing.Login });
  }

  private goToCheckout = () => {
    this.setState({ redirect: Routing.Checkout });
  }

  private goToDocuments = () => {
    this.setState({ displayDocuments: true });
  }

  public render(): JSX.Element {
    const { redirect, displayDocuments } = this.state;
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
                    <SignDocuments onSubmit={this.goToCheckout} />
                    : (
                      <>
                        <SignUpForm goToLogin={this.goToLogin} onSubmit={this.goToDocuments} renderMembershipOptions={true} />
                      </>
                    )
                  }
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Button id="auth-toggle" variant="outlined" color="secondary" fullWidth onClick={this.goToLogin}>
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

  return {
    stagedInvoices
  }
}

export default connect(mapStateToProps)(SignUpContainer);