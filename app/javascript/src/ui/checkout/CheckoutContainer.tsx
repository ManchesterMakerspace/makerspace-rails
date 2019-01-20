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
import Table from "ui/common/table/Table";
import { Column } from "ui/common/table/Table";
import { numberAsCurrency } from "ui/utils/numberToCurrency";
import PaymentMethodsContainer from "ui/checkout/PaymentMethodsContainer";
import ErrorMessage from "ui/common/ErrorMessage";
import LoadingOverlay from "ui/common/LoadingOverlay";
import LoginForm from "ui/auth/LoginForm";
import { BillingContext, Context } from "ui/billing/BillingContextContainer";
import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";

import { buildProfileRouting } from "ui/member/utils";

interface ContextProps {
  context: Context;
}
interface OwnProps {}
interface StateProps {
  invoices: CollectionOf<Invoice>;
  userId: string;
  error: string;
  isRequesting: boolean;
}
interface DispatchProps {
  submitCheckout: (invoices: Invoice[], paymentMethodId: string) => void;
}
interface ContextComponentProps extends Props, ContextProps { }
interface Props extends OwnProps, StateProps, DispatchProps {}
interface State {
  total: number;
  redirect: string;
  paymentMethodId: string;
  error: string;
  openLoginModal: boolean;
  openTransactionErrorModal: boolean;
}
class CheckoutContainer extends React.Component<ContextComponentProps,State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  constructor(props: ContextComponentProps){
    super(props);
    // Redirect if there are no invoices to checkout
    const { userId, invoices } = props;
    const redirectPath = userId ? Routing.Profile.replace(Routing.PathPlaceholder.MemberId, userId) : Routing.Login;
    const redirect = invoices && isEmpty(invoices) ? redirectPath : undefined;
    this.state = ({
      redirect,
      total: invoices && Object.values(invoices).reduce((a, b) => a + Number(b.amount), 0),
      error: "",
      paymentMethodId: undefined,
      openLoginModal: false,
      openTransactionErrorModal: false,
    });
  }

  private getFields = (): Column<Invoice>[] => [
    {
      id: "name",
      label: "Name",
      cell: (row: Invoice) => row.name,
    },
    {
      id: "description",
      label: "Description",
      cell: (row: Invoice) => {
        const discounts = row.discountId && this.props.context.discounts.data;
        const discount = discounts && discounts.find(discount => discount.id === row.discountId);
        return (
          <>
            <div>{row.description}</div>
            {discount && (
              <>
                <hr/>
                <div id="discount">{discount.description}</div>
              </>
            )}
          </>
        )
      },
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: Invoice) => numberAsCurrency(row.amount),
    },
  ];

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting, error, invoices, userId } = this.props;
    const { isRequesting: wasRequesting } = prevProps;
    const { paymentMethodId } = this.state;
    if (wasRequesting && !isRequesting) {
      // Open error modal if error exists after submitting payment
      if (error && paymentMethodId) {
        this.setState({ openTransactionErrorModal: true });
        return
      }
      // If there are no invoices, redirect to profile since there's nothing to do here
      if (isEmpty(invoices)) {
        const profileUrl = buildProfileRouting(userId);
        this.setState({ redirect: profileUrl });
      }
    }
  }

  private closeErrorModal = () => this.setState({ openTransactionErrorModal: false });
  private renderErrorModal = () => {
    const { invoices, error } = this.props;

    return (
      <FormModal
        formRef={this.setFormRef}
        id="payment-error-modal"
        title="Error processing transactions"
        isOpen={this.state.openTransactionErrorModal}
        onSubmit={this.closeErrorModal}
        submitText="Okay"
      >
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <Typography variant="body1">There was an error processing one or more transactions. Please review these errors and try again</Typography>
          </Grid>
          <Grid item xs={12}>
            <Table
              id="payment-invoices-table"
              error={error}
              data={Object.values(invoices)}
              columns={this.getFields()}
              rowId={this.rowId}
            />
          </Grid>
        </Grid>
      </FormModal>
    );
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
                columns={this.getFields()}
                rowId={this.rowId}
              />
            </Grid>
            <Grid item xs={12} style={{textAlign: "right"}}>
              <Typography id="total" variant="title" color="inherit">Total {numberAsCurrency(total)}</Typography>
            </Grid>
            <Grid item xs={12} style={{ textAlign: "left" }}>
              <Button id="submit-payment-button" variant="contained" disabled={!paymentMethodId} onClick={this.submitPayment}>Submit Payment</Button>
              {error && <ErrorMessage error={error} id="total-error"/>}
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
    const { isRequesting, error } = this.props;
    const { redirect, paymentMethodId } = this.state;

    if (redirect) {
      return <Redirect to={redirect}/>;
    }

    return (
      <Grid container spacing={16}>
        {isRequesting && <LoadingOverlay id="checkout-submitting-overlay" />}
        <Grid item sm={6} xs={12}>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <PaymentMethodsContainer
                    onPaymentMethodChange={this.selectPaymentMethod}
                    selectedPaymentMethodId={paymentMethodId}
                  />
                  <p>*The payment method used when creating a subscription will be the default payment method used for subscription payments unless changed through Settings.</p>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>


        <Grid item sm={6} xs={12}>
          {this.renderTotal()}
          {!isRequesting && error && <ErrorMessage id="checkout-submitting-error" error={error}/>}
        </Grid>
        {this.renderLoginModal()}
        {this.renderErrorModal()}
      </Grid>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const { invoices, isRequesting, error } = state.checkout;
  const { currentUser: { id: userId } } = state.auth;
  return {
    invoices,
    userId,
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

const ConnectedContainer =  connect(mapStateToProps, mapDispatchToProps)(CheckoutContainer);

export default React.forwardRef(
  (props: Props, ref: any) => (
    <BillingContext.Consumer>
      {context => <ConnectedContainer {...props} context={context} ref={ref} />}
    </BillingContext.Consumer>
  )
);