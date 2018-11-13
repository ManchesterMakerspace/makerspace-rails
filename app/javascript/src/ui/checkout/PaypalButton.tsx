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
  paymentMethodCallback?: (paymentMethodNonce: string) => void;
}

interface StateProps {
  clientToken: string;
  isRequesting: boolean;
}
interface DispatchProps {
}
interface Props extends DispatchProps, OwnProps, StateProps {}

interface State {
  paypalInstance: any;
  braintreeError: Braintree.BraintreeError;
}

class PaypalButton extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      paypalInstance: undefined,
      braintreeError: undefined,
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
          this.setState({ paypalInstance: paypalCheckoutInstance });
        });
      });
    } catch (err) {
      this.setState({ braintreeError: err });
    }
  }

  public render(): JSX.Element {
    const { braintreeError, paypalInstance } = this.state;
    const { isRequesting, braintreeInstance } = this.props;
    const error = braintreeError && (isString(braintreeError) ? braintreeError : braintreeError.message);

    return (
      <Grid container spacing={16} style={{position: "relative", overflow: "hidden"}}>
        <Grid item xs={12} style={{textAlign: "center"}}>
            <button id="paypal-button" style={{ background: "none", border: "none" }} />
            {braintreeInstance && !paypalInstance && isRequesting && (
              <>
                <Typography variant="body1">Contacting PayPal</Typography>
                <LoadingOverlay id="paypal-button-loading" contained={true} />)
              </>
            )}
            {!isRequesting && error && <ErrorMessage error={error} />}
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PaypalButton);