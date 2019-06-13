import * as React from "react";

import Grid from "@material-ui/core/Grid";
import Dialog from "@material-ui/core/Dialog";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import { Invoice } from "app/entities/invoice";
import { CollectionOf } from "app/interfaces";

import TableContainer from "ui/common/table/TableContainer";
import Table, { Column } from "ui/common/table/Table";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import PaymentMethodsContainer from "ui/checkout/PaymentMethodsContainer";
import ErrorMessage from "ui/common/ErrorMessage";
import LoadingOverlay from "ui/common/LoadingOverlay";
import LoginForm from "ui/auth/LoginForm";
import { BillingContext, Context } from "ui/billing/BillingContextContainer";
import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";

interface Props {
  invoices: CollectionOf<Invoice>;
  error: string | { [key: string]: string };
  isRequesting: boolean;
  onSubmit: (paymentMethodId: string) => void;
}
interface PropsWithContext extends Props {
  context: Context;
}
interface State {
  total: number;
  paymentMethodId: string;
  error: boolean;
  openLoginModal: boolean;
  openTransactionErrorModal: boolean;
}

class CheckoutPage extends React.Component<PropsWithContext, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  constructor(props: PropsWithContext) {
    super(props);
    // Redirect if there are no invoices to checkout
    const { invoices } = props;

    this.state = ({
      total: invoices && Object.values(invoices).reduce((a, b) => a + Number(b.amount), 0),
      error: false,
      paymentMethodId: undefined,
      openLoginModal: false,
      openTransactionErrorModal: false,
    });
  }

  private getFields = (errorState: boolean = false): Column<Invoice>[] => [
    {
      id: "name",
      label: "Name",
      cell: (row: Invoice) => row.name,
    },
    ...errorState ? []: [{
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
                <hr />
                <div id="discount">{discount.description}</div>
              </>
            )}
          </>
        )
      },
    }],
    {
      id: "amount",
      label: "Amount",
      cell: (row: Invoice) => numberAsCurrency(row.amount),
    },
    ...errorState ? [{
      id: "error",
      label: "Error",
      cell: (row: Invoice) => {
        const error = typeof this.props.error === 'object' ? 
                      this.props.error[row.id]
                      : this.props.error;

        return <ErrorMessage error={error}/>;
      },
    }]: [],
  ];

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting, error } = this.props;
    const { isRequesting: wasRequesting } = prevProps;
    const { paymentMethodId } = this.state;
    if (wasRequesting && !isRequesting) {
      // Open error modal if error exists after submitting payment
      if (error && paymentMethodId) {
        this.setState({ error: !!error, openTransactionErrorModal: true });
        return
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
              error={typeof error === 'string' && error}
              data={Object.values(invoices)}
              columns={this.getFields(true)}
              rowId={this.rowId}
            />
          </Grid>
        </Grid>
      </FormModal>
    );
  }

  private renderTotal = () => {
    const { invoices } = this.props;
    const { total, paymentMethodId } = this.state;
    return (
      <Card style={{ height: "100%" }}>
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
            <Grid item xs={12} style={{ textAlign: "right" }}>
              <Typography id="total" variant="h6" color="inherit">Total {numberAsCurrency(total)}</Typography>
            </Grid>
            <Grid item xs={12} style={{ textAlign: "left" }}>
              <Button id="submit-payment-button" variant="contained" disabled={!paymentMethodId} onClick={this.submitPayment}>Submit Payment</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }

  private submitPayment = () => {
    const { paymentMethodId } = this.state;
    this.props.onSubmit(paymentMethodId);
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

    return (
      <Grid container spacing={16}>
        {isRequesting && <LoadingOverlay id="checkout-submitting-overlay" />}
        <Grid item sm={5} xs={12}>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <PaymentMethodsContainer
                    onPaymentMethodChange={this.selectPaymentMethod}
                  />
                  <p>*The payment method used when creating a subscription will be the default payment method used for subscription payments unless changed through Settings.</p>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>


        <Grid item sm={7} xs={12}>
          {this.renderTotal()}
          {!isRequesting && error && <ErrorMessage id="checkout-submitting-error" error={typeof error === 'string' && error} />}
        </Grid>
        {this.renderLoginModal()}
        {this.renderErrorModal()}
      </Grid>
    )
  }
}

export default (props: Props) => (
  <BillingContext.Consumer>
    {context => <CheckoutPage {...props} context={context} />}
  </BillingContext.Consumer>
);