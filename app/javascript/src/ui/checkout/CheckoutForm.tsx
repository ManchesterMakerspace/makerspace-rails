import * as React from "react";
import { connect } from "react-redux";
import { Grid, Button, Typography } from "@material-ui/core";

//@ts-ignore
import * as Braintree from "braintree-web";
import { PaymentMethod } from "app/entities/invoice";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { getClientTokenAction } from "ui/checkout/actions";
import CreditCardForm from "ui/checkout/CreditCardForm";
import PaypalButton from "ui/checkout/PaypalButton";
import ErrorMessage from "ui/common/ErrorMessage";


interface OwnProps {}
interface StateProps {
  clientToken: string;
  isRequesting: boolean;
}
interface DispatchProps {
  getClientToken: () => void;
}
interface Props extends DispatchProps, OwnProps, StateProps {}

interface State {
  braintreeInstance: any;
  braintreeError: Braintree.BraintreeError;
  paymentMethodNonce: string;
  paymentMethod: PaymentMethod;
}

class CheckoutForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      braintreeError: undefined,
      paymentMethodNonce: undefined,
      braintreeInstance: undefined,
      paymentMethod: undefined,
    }
  }
  public componentDidMount() {
    this.props.getClientToken();
  }

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isRequesting, clientToken } = this.props;

    if (wasRequesting && !isRequesting && !!clientToken) {
      this.initBraintree();
    }
  }

  private initBraintree = async () => {
    const { clientToken } = this.props;

    try {
      await Braintree.client.create({
        authorization: clientToken,
      }, (err, clientInstance) => {
        if (err) throw err;
        this.setState({ braintreeInstance: clientInstance });
      });
    } catch (err) {
      this.setState({ braintreeError: err });
    }
  }

  private selectPaypal = () => this.setState({ paymentMethod: PaymentMethod.PayPal });
  private selectCC = () => this.setState({ paymentMethod: PaymentMethod.CreditCard });
  private selectCash = () => this.setState({ paymentMethod: PaymentMethod.Cash });

  private renderPaymentMethod = () => { 
    const { braintreeInstance, paymentMethod } = this.state;
    if (braintreeInstance) {
      switch (paymentMethod) {
        case PaymentMethod.CreditCard:
          return (
            <CreditCardForm
              braintreeInstance={braintreeInstance}
            />
          );
        case PaymentMethod.PayPal:
          return (
            <PaypalButton
              braintreeInstance={braintreeInstance}
            />
          );
      }
    }
  }

  private renderMethodRequest = () => {
    const { braintreeError } = this.state;
    const { isRequesting } = this.props;
    return (
      <Grid container justify="center" spacing={16}>
        <Grid item xs={12} style={{textAlign:"center"}}>
          <Typography variant="subheading">Select Payment Method</Typography>
        </Grid>
        <Grid item xs={12}>
          <Button fullWidth variant="outlined" onClick={this.selectCC}>Credit Card</Button>
        </Grid>
        <Grid item xs={12}>
          <Button fullWidth variant="outlined" onClick={this.selectPaypal}>PayPal</Button>
        </Grid>
        {!isRequesting && braintreeError && braintreeError.message && <ErrorMessage error={braintreeError.message} />}
      </Grid>
    );
  }

  public render(): JSX.Element {
    const { paymentMethod } = this.state;

    return paymentMethod ? this.renderPaymentMethod() : this.renderMethodRequest();
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
    getClientToken: () => dispatch(getClientTokenAction()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutForm);