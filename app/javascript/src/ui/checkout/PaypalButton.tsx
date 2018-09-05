import * as React from "react";
import { connect } from "react-redux";

//@ts-ignore
import * as Braintree from "braintree-web";
//@ts-ignore
import * as checkoutJs from "checkout.js";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { getClientTokenAction, submitPaymentAction } from "ui/checkout/actions";
import { readPlansAction } from "ui/billingPlans/actions";
import { Button, TextField, Grid, Typography, FormControl, InputLabel, FormControlLabel, FormLabel } from "@material-ui/core";
import Form from "ui/common/Form";
import { CheckoutFields } from "ui/checkout/constants";
import ErrorMessage from "ui/common/ErrorMessage";
import HostedInput from "ui/checkout/HostedInput";

const paypalCheckout = (Braintree as any).paypalCheckout;

interface OwnProps {
  braintreeInstance: any;
  amount: string | number;
}

interface StateProps {
  clientToken: string;
  isRequesting: boolean;
}
interface DispatchProps {
  submitPayment: (nonce: string) => void;
}
interface Props extends DispatchProps, OwnProps, StateProps {}

interface State {
  paypalInstance: any;
  braintreeError: Braintree.BraintreeError;
  paymentMethodNonce: string;
}

class PaypalButton extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      paypalInstance: undefined,
      braintreeError: undefined,
      paymentMethodNonce: undefined,
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { braintreeInstance } = this.props;
    const { braintreeInstance: oldInstance } = prevProps;

    // When client initialized
    if (!oldInstance && braintreeInstance) {
      this.initPaypal();
    }
  }

  private initPaypal = async () => {
    const { braintreeInstance } = this.props;
    try {
      await paypalCheckout.create({
        client: braintreeInstance
      }, (paypalCheckoutErr: any, paypalCheckoutInstance: any) => {
    
        // Stop if there was a problem creating PayPal Checkout.
        // This could happen if there was a network error or if it's incorrectly
        // configured.
        if (paypalCheckoutErr) throw paypalCheckoutErr;
        this.setState({ paypalInstance: paypalCheckoutInstance });

        checkoutJs.Button.render({
          env: 'sandbox', // or 'sandbox'

          payment: function () {
            return paypalCheckoutInstance.createPayment({
              flow: 'vault',
              billingAgreementDescription: 'Your agreement description',
              enableShippingAddress: true,
              shippingAddressEditable: false,
              shippingAddressOverride: {
                recipientName: 'Scruff McGruff',
                line1: '1234 Main St.',
                line2: 'Unit 1',
                city: 'Chicago',
                countryCode: 'US',
                postalCode: '60652',
                state: 'IL',
                phone: '123.456.7890'
              }
            });
          },

          onAuthorize: function (data: any, actions: any) {
            return paypalCheckoutInstance.tokenizePayment(data, function (err: any, payload: any) {
              // Submit `payload.nonce` to your server.
            });
          },

          onCancel: function (data: any) {
            console.log('checkout.js payment cancelled');
          },

          onError: function (err: any) {
            console.error('checkout.js error', err);
          }
        }, '#paypal-button').then(function () {
          // The PayPal button will be rendered in an html element with the id
          // `paypal-button`. This function will be called when the PayPal button
          // is set up and ready to be used.
        });
      });
    } catch (err) {
      this.setState({ braintreeError: err });
    }
  }

  private requestPaymentMethod = () => {
    const { paypalInstance } = this.state;
    const { amount } = this.props;

    if (paypalInstance) {
      paypalInstance.tokenize({ 
        amount,
        currency: "USD",
        flow: "vault"
      }, (err: Braintree.BraintreeError, payload:{ [key: string]: string }) => {
        if (err) {
          console.log(err);
          this.setState({ braintreeError: err });
        }
        this.setState({ paymentMethodNonce: payload.nonce });
      });
    }
  }

  private submitPayment = async () => {
    const { submitPayment } = this.props;
    const { paymentMethodNonce } = this.state;
    await submitPayment(paymentMethodNonce);
  }

  public render(): JSX.Element {
    const { braintreeError, paypalInstance  } = this.state;
    const { isRequesting, braintreeInstance } = this.props;
    return (
      <>
        <Form
          id="paypal-form"
          onSubmit={this.requestPaymentMethod}
          submitText="Paypallllll"
          loading={isRequesting || !braintreeInstance || !paypalInstance }
        >
          <button id="paypal-button"/>
          {!isRequesting && braintreeError && braintreeError.message && <ErrorMessage error={braintreeError.message} />}
        </Form>
      </>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const { isRequesting, clientToken } = state.checkout;

  return {
    isRequesting,
    clientToken
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    submitPayment: (nonce) => dispatch(submitPaymentAction(nonce)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PaypalButton);