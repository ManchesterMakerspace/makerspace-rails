import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";

import Grid from "@material-ui/core/Grid";
import Dialog from "@material-ui/core/Dialog";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import isEmpty from "lodash-es/isEmpty";

import { Invoice } from "app/entities/invoice";
import { Routing } from "app/constants";
import { CollectionOf } from "app/interfaces";

import { submitPaymentAction } from "ui/checkout/actions";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { numberAsCurrency } from "ui/utils/numberToCurrency";
import PaymentMethodsContainer from "ui/checkout/PaymentMethodsContainer";
import ErrorMessage from "ui/common/ErrorMessage";
import LoadingOverlay from "ui/common/LoadingOverlay";
import LoginForm from "ui/auth/LoginForm";

interface OwnProps {}
interface StateProps {
  clientToken: string;
  invoices: CollectionOf<Invoice>;
  auth: string;
  error: string;
  isRequesting: boolean;
}
interface DispatchProps {
  submitCheckout: (invoices: Invoice[], paymentMethodId: string) => void;
}
interface Props extends OwnProps, StateProps, DispatchProps {}
interface State {
  total: number;
  redirect: string;
  paymentMethodId: string;
  error: string;
  openLoginModal: boolean;
}
class CheckoutContainer extends React.Component<Props,State>{
  constructor(props: Props){
    super(props);
    // Redirect if there are no invoices to checkout
    const { auth, invoices } = props;
    const redirectPath = auth ? Routing.Profile.replace(Routing.PathPlaceholder.MemberId, auth) : Routing.Login;
    const redirect = invoices && isEmpty(invoices) ? redirectPath : undefined;
    this.state = ({
      redirect,
      total: invoices && Object.values(invoices).reduce((a, b) => a + Number(b.amount), 0),
      error: "",
      paymentMethodId: undefined,
      openLoginModal: false,
    });
  }

  private fields: Column<Invoice>[] = [
    {
      id: "description",
      label: "Description",
      cell: (row: Invoice) => row.description,
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: Invoice) => numberAsCurrency(row.amount),
    },
  ];

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting, error } = this.props;
    const { isRequesting: wasRequesting, clientToken: hadClientToken } = prevProps;
    if (wasRequesting && !isRequesting && !error && hadClientToken) {
      console.log("SUCCESS, redirect to receipt page")
    }
  }

  private renderTotal = () => {
    const { invoices } = this.props;
    const { total, paymentMethodId, error } = this.state;
    return (
      <Card style={{height: "100%"}}>
        <CardContent>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <TableContainer
                id="checkout-invoices-table"
                title="Review Items Before Purchase"
                data={Object.values(invoices)}
                totalItems={Object.values(invoices).length}
                columns={this.fields}
                rowId={this.rowId}
              />
            </Grid>
            <Grid item xs={12} style={{textAlign: "right"}}>
              <Typography variant="title" color="inherit">Total {numberAsCurrency(total)}</Typography>
            </Grid>
            <Grid item xs={12} style={{ textAlign: "left" }}>
              <Button variant="contained" disabled={!paymentMethodId} onClick={this.submitPayment}>Submit Payment</Button>
              {error && <ErrorMessage error={error}/>}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }

  private submitPayment = () => {
    const { paymentMethodId } = this.state;
    const { invoices } = this.props;
    if (!paymentMethodId) {
      this.setState({ error: "Payment method required before continuing."});
      return;
    }
    this.props.submitCheckout(Object.values(invoices), paymentMethodId);
  }

  private selectPaymentMethod = (paymentMethodId: string) => {
    this.setState({ paymentMethodId });
  }

  private openLoginModal = () => {
    this.setState({ openLoginModal: true });
  }
  private closeLoginModal = () => {
    this.setState({ openLoginModal: false });
  }
  private renderLoginModal = () => {
    return (
      <Dialog
        fullWidth={true}
        open={this.state.openLoginModal}
        onClose={this.closeLoginModal}
        disableBackdropClick={true}
      >
        <LoginForm />
      </Dialog>
    );
  }
  private rowId = (row: Invoice) => row.id;
  public render(): JSX.Element {
    const { isRequesting, error, auth } = this.props;
    const { redirect, paymentMethodId } = this.state;

    if (redirect) {
      return <Redirect to={redirect}/>
    }
    //TODO Make settings a link
    return (
      <Grid container spacing={16}>
        {isRequesting && <LoadingOverlay id="checkout-submitting-overlay" />}
        <Grid item md={8} sm={7} xs={12}>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <PaymentMethodsContainer
                    onPaymentMethodChange={this.selectPaymentMethod}
                    selectedPaymentMethodId={paymentMethodId}
                  />
                  <p>*The payment method used when creating a subscription will be the default payment method unless changed through Settings.</p>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>


        <Grid item md={4} sm={5} xs={12}>
          {this.renderTotal()}
          {!isRequesting && error && <ErrorMessage id="checkout-submitting-error" error={error}/>}
        </Grid>
        {this.renderLoginModal()}
      </Grid>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const { invoices, isRequesting, error, clientToken } = state.checkout;
  const { currentUser: { id: userId } } = state.auth;
  return {
    clientToken,
    invoices,
    auth: userId,
    isRequesting,
    error
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    submitCheckout: (invoices, paymentMethodId) => dispatch(submitPaymentAction(paymentMethodId, invoices)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutContainer);