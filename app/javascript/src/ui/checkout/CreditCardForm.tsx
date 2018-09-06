import * as React from "react";
import { connect } from "react-redux";

//@ts-ignore
import * as Braintree from "braintree-web";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { submitPaymentAction } from "ui/checkout/actions";
import { Grid } from "@material-ui/core";
import Form from "ui/common/Form";
import { CheckoutFields } from "ui/checkout/constants";
import ErrorMessage from "ui/common/ErrorMessage";
import HostedInput from "ui/checkout/HostedInput";

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
  hostedFieldsInstance: any;
  braintreeError: Braintree.BraintreeError;
  paymentMethodNonce: string;
}

class CreditCardForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      hostedFieldsInstance: undefined,
      braintreeError: undefined,
      paymentMethodNonce: undefined,
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { braintreeInstance } = this.props;
    const { braintreeInstance: oldInstance } = prevProps;

    if (!oldInstance && braintreeInstance) {
      this.initHostedFields();
    }
  }

  private initHostedFields = async () => {
    const { braintreeInstance } = this.props;

    try {
      await Braintree.hostedFields.create({
        client: braintreeInstance,
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
          postalCode: {
            selector: `#${CheckoutFields.postalCode.name}`,
            placeholder: CheckoutFields.postalCode.placeholder,
          },
        }
      }, (err, hostedFieldsInstance) => {
        if (err) throw err;
        this.setState({ hostedFieldsInstance: hostedFieldsInstance });
      });
    } catch (err) {
      this.setState({ braintreeError: err });
    }
  }

  private requestPaymentMethod = () => {
    const { hostedFieldsInstance } = this.state;
    if (hostedFieldsInstance) {
      hostedFieldsInstance.tokenize((err: Braintree.BraintreeError, payload:{ [key: string]: string }) => {
        if (err) {
          this.setState({ braintreeError: err });
        } else {
          console.log(payload.nonce)
          this.setState({ paymentMethodNonce: payload.nonce });
        }
      });
    }
  }

  public render(): JSX.Element {
    const { braintreeError, hostedFieldsInstance  } = this.state;
    const { isRequesting, braintreeInstance } = this.props;
    return (
      <>
        <Form
          id="checkout-form"
          onSubmit={this.requestPaymentMethod}
          loading={isRequesting || !braintreeInstance || !hostedFieldsInstance }
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
            label={CheckoutFields.postalCode.label}
            id={CheckoutFields.postalCode.name}
          />
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

export default connect(mapStateToProps, mapDispatchToProps)(CreditCardForm);