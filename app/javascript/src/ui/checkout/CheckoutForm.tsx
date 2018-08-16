import * as React from "react";
import { connect } from "react-redux";

//@ts-ignore
import * as Braintree from "braintree-web";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { getClientTokenAction, submitPaymentAction } from "ui/checkout/actions";
import { readPlansAction } from "ui/billingPlans/actions";
import { Button, TextField, Grid, Typography, FormControl, InputLabel, FormControlLabel, FormLabel } from "@material-ui/core";
import Form from "ui/common/Form";
import { CheckoutFields } from "ui/checkout/constants";
import ErrorMessage from "ui/common/ErrorMessage";
import HostedInput from "ui/checkout/HostedInput";

interface OwnProps {}
interface StateProps {
  clientToken: string;
  isRequesting: boolean;
}
interface DispatchProps {
  getPlans: () => void;
  getClientToken: () => void;
  submitPayment: (nonce: string) => void;
}
interface Props extends DispatchProps, OwnProps, StateProps {}

interface State {
  braintreeInstance: any;
  braintreeError: Braintree.BraintreeError;
  paymentMethodNonce: string;
}

class CheckoutForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      braintreeError: undefined,
      paymentMethodNonce: undefined,
      braintreeInstance: undefined,
    }
  }
  public componentDidMount() {
    this.props.getPlans();
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
        Braintree.hostedFields.create({
          client: clientInstance,
          styles: {},
          fields: {
            number: {
              selector: `#${CheckoutFields.cardNumber.name}`,
              placeholder: CheckoutFields.cardNumber.placeholder
            },
            cvv: {
              selector: `#${CheckoutFields.csv.name}`,
              placeholder: CheckoutFields.csv.placeholder
            },
            expirationDate: {
              selector: `#${CheckoutFields.expirationDate.name}`,
              placeholder: CheckoutFields.expirationDate.placeholder,
            },
          }
        }, (err, hostedFieldsInstance) => {
          if (err) throw err;
          this.setState({ braintreeInstance: hostedFieldsInstance });
        })
      });
    } catch (err) {
      this.setState({ braintreeError: err });
    }
  }

  private requestPaymentMethod = () => {
    const { braintreeInstance } = this.state;
    if (braintreeInstance) {
      braintreeInstance.tokenize((err: Braintree.BraintreeError, payload:{ [key: string]: string }) => {
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
    await submitPayment(paymentMethodNonce)
  }

  public render(): JSX.Element {
    const { braintreeError } = this.state;
    const { isRequesting } = this.props;
    return (
      <>
        <Form
          id="checkout-form"
          onSubmit={this.requestPaymentMethod}
          loading={isRequesting}
        >
          <HostedInput
            label={CheckoutFields.cardNumber.label}
            id={CheckoutFields.cardNumber.name}
          />
          <Grid container spacing={24}>
            <Grid item xs={6}>
              <HostedInput
                label={CheckoutFields.expirationDate.label}
                id={CheckoutFields.expirationDate.name}
              />
            </Grid>
            <Grid item xs={6}>
              <HostedInput
                label={CheckoutFields.csv.label}
                id={CheckoutFields.csv.name}
              />
            </Grid>
          </Grid>
          <HostedInput
            label={CheckoutFields.zipcode.label}
            id={CheckoutFields.zipcode.name}
          />
          <Button onClick={this.submitPayment}>Submit Payment</Button>
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
    getPlans: () => dispatch(readPlansAction()),
    getClientToken: () => dispatch(getClientTokenAction()),
    submitPayment: (nonce) => dispatch(submitPaymentAction(nonce)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutForm);