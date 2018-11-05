import * as React from "react";

import Grid from "@material-ui/core/Grid";
import Dialog from "@material-ui/core/Dialog";
import List from "@material-ui/core/List";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import PaymentMethodForm from "ui/checkout/PaymentMethodForm";
import { getPaymentMethods } from "api/paymentMethods/transactions";
import LoadingOverlay from "ui/common/LoadingOverlay";
import ErrorMessage from "ui/common/ErrorMessage";
import { PaymentMethod, isCreditCard } from "app/entities/paymentMethod";

interface OwnProps {
  onPaymentMethodChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedPaymentMethodId: string;
}
interface Props extends OwnProps {}
interface State {
  isRequesting: boolean;
  // TODO: Fix type when known
  paymentMethods: PaymentMethod[];
  error: string;
  openAddPayment: boolean;
}

class PaymentMethods extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isRequesting: false,
      paymentMethods: [],
      error: "",
      openAddPayment: false
    };
  }

  public componentDidMount() {
    this.fetchPaymentMethods();
  }

  private fetchPaymentMethods = async () => {
    this.setState({ isRequesting: true });
    try {
      const { data } = await getPaymentMethods();
      this.setState({ isRequesting: false, paymentMethods: data.paymentMethods });
    } catch (e) {
      this.setState({ isRequesting: false, error: e.errorMessage });
    }
  }

  private addNewPaymentMethod = () => {
    this.setState({ openAddPayment: true });
  }

  private closeAddPaymentMethod = () => {
    this.setState({ openAddPayment: false });
  }

  private renderAddPaymentForm = () => {
    return (
      <Dialog
        fullWidth={true}
        open={this.state.openAddPayment}
        onClose={this.closeAddPaymentMethod}
        style={{minHeight: 300}}
        disableBackdropClick={true}
      >
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <PaymentMethodForm closeHandler={this.closeAddPaymentMethod}/>
                {<Button variant="outlined" id={`payment-method-cancel`} onClick={this.closeAddPaymentMethod}>Cancel</Button>}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Dialog>
    );
  }

  private renderPaymentMethod = (paymentMethod: PaymentMethod) => {
    let label: string;
    if (isCreditCard(paymentMethod)) {
      label = `${paymentMethod.cardType} ending in ${paymentMethod.last4}`;
    } else {
      label = "PayPal";
    }
    return (
      <FormControlLabel key={paymentMethod.id} value={paymentMethod.id} control={<Radio color="primary" />} label={label} />
    )
  }

  public render(): JSX.Element {
    const { isRequesting, paymentMethods, error } = this.state;

    return (
      <>
        <Grid container justify="center" spacing={16}>
          <Grid item xs={12}>
            <Typography variant="title" color="inherit">Please Select a Payment Method</Typography>
            {isRequesting && <LoadingOverlay id="get-payment-methods" contained={true} />}
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="Payment Method"
                name="paymentMethodSelection"
                value={this.props.selectedPaymentMethodId}
                onChange={this.props.onPaymentMethodChange}
              >
                {Array.isArray(paymentMethods) && paymentMethods.map((paymentMethod) => (
                  this.renderPaymentMethod(paymentMethod)
                ))}
              </RadioGroup>
              <ErrorMessage id={`get-payment-methods-error`} error={!isRequesting && error} />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" color="primary" disabled={isRequesting} onClick={this.addNewPaymentMethod}>Add New Payment Method</Button>
          </Grid>
        </Grid>
        {this.renderAddPaymentForm()}
      </>
    );
  }
}

export default PaymentMethods;