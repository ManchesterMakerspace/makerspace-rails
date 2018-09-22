import * as React from "react";
import { connect } from "react-redux";
import { Grid } from '@material-ui/core';

//@ts-ignore
import * as Braintree from "braintree-web";
//@ts-ignore
import * as checkoutJs from "paypal-checkout";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { submitPaymentAction } from "ui/checkout/actions";
import ErrorMessage from "ui/common/ErrorMessage";
import LoadingOverlay from "ui/common/LoadingOverlay";

interface OwnProps {
  braintreeInstance: any;
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

  public componentDidMount() {
    this.initPaypal();
  }

  private initPaypal = async () => {
    const { braintreeInstance } = this.props;
    try {
      await (Braintree as any).paypalCheckout.create({
        client: braintreeInstance
      }, (paypalCheckoutErr: any, paypalCheckoutInstance: any) => {
    
        if (paypalCheckoutErr) throw paypalCheckoutErr;

        checkoutJs.Button.render({
          env: "sandbox",
          payment: function () {
            return paypalCheckoutInstance.createPayment({
              flow: 'vault',
            });
          },

          onAuthorize: function (data: any, actions: any) {
            return paypalCheckoutInstance.tokenizePayment(data, function (err: any, payload: any) {
              if (err) throw err;
              console.log(payload.nonce)
              this.setState({ paymentMethodNonce: payload.nonce });
            });
          },

          onCancel: function (data: any) {
            console.log('checkout.js payment cancelled');
          },

          onError: function (err: any) {
            if (err) throw err;
          }
        }, '#paypal-button').then(() => {
          this.setState({ paypalInstance: paypalCheckoutInstance });
        });
      });
    } catch (err) {
      this.setState({ braintreeError: err });
    }
  }

  public render(): JSX.Element {
    const { braintreeError, paypalInstance  } = this.state;
    const { isRequesting } = this.props;
    return (
      <Grid container spacing={16} style={{position: "relative", overflow: "hidden"}}>
        <Grid item xs={12} style={{textAlign: "center"}}>
          {!paypalInstance &&  <LoadingOverlay id="paypal-button-loading"/>}
          <button id="paypal-button" style={{background: "none", border: "none"}}/>
          {!isRequesting && braintreeError && braintreeError.message && <ErrorMessage error={braintreeError.message} />}
        </Grid>
      </Grid>
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