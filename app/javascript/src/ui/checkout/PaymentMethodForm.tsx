import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

//@ts-ignore
import * as Braintree from "braintree-web";
import { PaymentMethodType } from "app/entities/invoice";

import { getClientToken } from "api/checkout/transactions";

import CreditCardForm from "ui/checkout/CreditCardForm";
import PaypalButton from "ui/checkout/PaypalButton";
import ErrorMessage from "ui/common/ErrorMessage";
import LoadingOverlay from "ui/common/LoadingOverlay";


interface OwnProps {
  closeHandler: () => void;
  onSuccess: (paymentMethodNonce: string) => void;
}
interface Props extends OwnProps {}

interface State {
  braintreeInstance: any;
  braintreeError: Braintree.BraintreeError;
  paymentMethodNonce: string;
  paymentMethodType: PaymentMethodType;
  clientToken: string;
  requestingClientToken: boolean;
  braintreeRequesting: boolean;
  clientTokenError: string;
}

class PaymentMethodForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      braintreeError: undefined,
      paymentMethodNonce: undefined,
      braintreeInstance: undefined,
      braintreeRequesting: false,
      paymentMethodType: undefined,
      clientToken: undefined,
      requestingClientToken: false,
      clientTokenError: ""
    }
  }
  public componentDidMount() {
    this.getClientToken();
  }

  private getClientToken = async () => {
    this.setState({
      requestingClientToken: true
    });

    let token;
    let error = "";
    try {
      const response = await getClientToken();
      token = response.data.client_token;
    } catch (e) {
      error = e.errorMessage;
    }
    this.setState({
      requestingClientToken: false,
      clientTokenError: error,
      clientToken: token
    });

    if (token) {
      this.initBraintree();
    }
  }

  private initBraintree = async () => {
    const { clientToken } = this.state;

    try {
      this.setState({ braintreeRequesting: true });
      await Braintree.client.create({
        authorization: clientToken,
      }, (err, clientInstance) => {
        if (err) throw err;
        this.setState({ braintreeInstance: clientInstance, braintreeRequesting: false });
      });
    } catch (err) {
      this.setState({ braintreeError: err, braintreeRequesting: false });
    }
  }

  private selectPaypal = () => this.setState({ paymentMethodType: PaymentMethodType.PayPal });
  private selectCC = () => this.setState({ paymentMethodType: PaymentMethodType.CreditCard });
  private selectCash = () => this.setState({ paymentMethodType: PaymentMethodType.Cash });

  private renderPaymentMethod = () => {
    const { braintreeInstance, paymentMethodType, clientToken } = this.state;
    switch (paymentMethodType) {
      case PaymentMethodType.CreditCard:
        return (
          <CreditCardForm
            closeHandler={this.props.closeHandler}
            braintreeInstance={braintreeInstance}
            clientToken={clientToken}
            onSuccess={this.props.onSuccess}
          />
        );
      default:
        return <></>;
    }
  }

  private renderMethodRequest = () => {
    const { braintreeError, braintreeInstance, clientToken, requestingClientToken, clientTokenError, braintreeRequesting } = this.state;
    const error = clientTokenError || (braintreeError && braintreeError.message);

    return (
      <Grid container justify="center" spacing={16}>
        <Grid item xs={12} style={{textAlign:"center"}}>
          <Typography variant="subheading">Select Payment Method</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button fullWidth variant="outlined" onClick={this.selectCC} id="card-payment">Credit or debit card</Button>
        </Grid>
        <Grid item xs={12}>
          <PaypalButton
            clientToken={clientToken}
            braintreeInstance={braintreeInstance}
            paymentMethodCallback={this.props.closeHandler}
          />
        </Grid>
        {(requestingClientToken || braintreeRequesting) && <LoadingOverlay id="payment-method-loading" contained={true}/>}
        {error && <ErrorMessage error={error} id="payment-method--form-error"/>}
      </Grid>
    );
  }

  public render(): JSX.Element {
    const { paymentMethodType } = this.state;

    return paymentMethodType ? this.renderPaymentMethod() : this.renderMethodRequest();
  }
}

export default PaymentMethodForm;