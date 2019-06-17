import * as React from "react";
import { connect } from "react-redux";
import Grid from '@material-ui/core/Grid';
import isString from "lodash-es/isString";

//@ts-ignore
import * as Braintree from "braintree-web";
//@ts-ignore
import * as checkoutJs from "paypal-checkout";

import { postPaymentMethod } from "api/paymentMethods/transactions";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import ErrorMessage from "ui/common/ErrorMessage";
import LoadingOverlay from "ui/common/LoadingOverlay";
import Typography from "@material-ui/core/Typography";

interface OwnProps {
  braintreeInstance: any;
  clientToken: string;
  paymentMethodCallback?: (paymentMethodNonce: string) => void;
}

interface Props extends OwnProps {}

interface State {
  paypalInstance: any;
  braintreeError: Braintree.BraintreeError;
  paypalRequesting: boolean;
}

class PaypalButton extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      paypalInstance: undefined,
      braintreeError: undefined,
      paypalRequesting: false,
    }
  }

  public componentDidMount() {
    this.props.braintreeInstance && this.initPaypal();
  }

  public componentDidUpdate(prevProps: Props) {
    const { braintreeInstance } = this.props;
    const { braintreeInstance: prevBraintreeInstance } = prevProps;
    if (!prevBraintreeInstance && braintreeInstance) {
      this.initPaypal();
    }
  }

  private initPaypal = async () => {
    const { braintreeInstance } = this.props;
    try {
      this.setState({ paypalRequesting: true });
      await (Braintree as any).paypalCheckout.create({
        client: braintreeInstance
      }, (paypalCheckoutErr: any, paypalCheckoutInstance: any) => {

        if (paypalCheckoutErr) throw paypalCheckoutErr;

        checkoutJs.Button.render({
          env: "sandbox",
          payment: () => {
            return paypalCheckoutInstance.createPayment({
              flow: 'vault',
            });
          },

          onAuthorize: (data: any, actions: any) => {
            this.setState({ braintreeError: undefined });
            return paypalCheckoutInstance.tokenizePayment(data, async (err: any, payload: any) => {
              if (err) throw err;
              try {
                await postPaymentMethod(payload.nonce);
                this.props.paymentMethodCallback && this.props.paymentMethodCallback(payload.nonce);
              } catch (e) {
                const { errorMessage } = e;
                this.setState({ braintreeError: errorMessage });
              }
            });
          },

          onCancel: (data: any) => {
            console.log('checkout.js payment cancelled');
          },

          onError: (err: any) => {
            if (err) throw err;
          }
        }, '#paypal-button').then(() => {
          this.setState({ paypalInstance: paypalCheckoutInstance, paypalRequesting: false });
        });
      });
    } catch (err) {
      this.setState({ braintreeError: err, paypalRequesting: false });
    }
  }

  public render(): JSX.Element {
    const { braintreeError, paypalRequesting } = this.state;
    const { braintreeInstance } = this.props;
    const error = braintreeError && (isString(braintreeError) ? braintreeError : braintreeError.message);
    const loading = braintreeInstance && paypalRequesting;
    return (
      <Grid container spacing={16} style={{position: "relative", overflow: "hidden"}}>
        <Grid item xs={12} style={{textAlign: "center"}}>
            <button id="paypal-button" style={{ background: "none", border: "none" }} />
            {loading && <Typography variant="body1">Contacting PayPal</Typography>}
            {error && <ErrorMessage error={error} id="paypal-error"/>}
        </Grid>

        {loading && <LoadingOverlay id="paypal-button" />}
      </Grid>
    )
  }
}

export default PaypalButton;