import * as React from "react";
import { connect } from "react-redux";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

//@ts-ignore
import * as Braintree from "braintree-web";
import { PaymentMethodType } from "app/entities/invoice";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { getClientTokenAction } from "ui/checkout/actions";
import CreditCardForm from "ui/checkout/CreditCardForm";
import PaypalButton from "ui/checkout/PaypalButton";
import ErrorMessage from "ui/common/ErrorMessage";
import LoadingOverlay from "ui/common/LoadingOverlay";


interface OwnProps {
  closeHandler: () => void;
  onSuccess: (paymentMethodNonce: string) => void;
}
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
  paymentMethodType: PaymentMethodType;
}

class PaymentMethodForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      braintreeError: undefined,
      paymentMethodNonce: undefined,
      braintreeInstance: undefined,
      paymentMethodType: undefined,
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

  private selectPaypal = () => this.setState({ paymentMethodType: PaymentMethodType.PayPal });
  private selectCC = () => this.setState({ paymentMethodType: PaymentMethodType.CreditCard });
  private selectCash = () => this.setState({ paymentMethodType: PaymentMethodType.Cash });

  private renderPaymentMethod = () => {
    const { braintreeInstance, paymentMethodType } = this.state;
    switch (paymentMethodType) {
      case PaymentMethodType.CreditCard:
        return (
          <CreditCardForm
            closeHandler={this.props.closeHandler}
            braintreeInstance={braintreeInstance}
            onSuccess={this.props.onSuccess}
          />
        );
      default:
        return <></>;
    }
  }

  private renderMethodRequest = () => {
    const { braintreeError, braintreeInstance } = this.state;
    const { isRequesting } = this.props;

    return (
      <Grid container justify="center" spacing={16}>
        <Grid item xs={12} style={{textAlign:"center"}}>
          <Typography variant="subheading">Select Payment Method</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button fullWidth variant="outlined" onClick={this.selectCC}>Credit Card</Button>
        </Grid>
        <Grid item xs={12}>
          <PaypalButton
            braintreeInstance={braintreeInstance}
            paymentMethodCallback={this.props.closeHandler}
          />
        </Grid>
        {(isRequesting || !braintreeInstance) && <LoadingOverlay id="payment-method-loading"/>}
        {!isRequesting && braintreeError && braintreeError.message && <ErrorMessage error={braintreeError.message} />}
      </Grid>
    );
  }

  public render(): JSX.Element {
    const { paymentMethodType } = this.state;

    return paymentMethodType ? this.renderPaymentMethod() : this.renderMethodRequest();
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

export default connect(mapStateToProps, mapDispatchToProps)(PaymentMethodForm);