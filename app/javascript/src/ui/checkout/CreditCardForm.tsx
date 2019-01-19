import * as React from "react";
import { connect } from "react-redux";
import isString from "lodash-es/isString";

import Grid from "@material-ui/core/Grid";

//@ts-ignore
import * as Braintree from "braintree-web";

import { postPaymentMethod } from "api/paymentMethods/transactions";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import Form from "ui/common/Form";
import { CreditCardFields } from "ui/checkout/constants";
import ErrorMessage from "ui/common/ErrorMessage";
import HostedInput from "ui/checkout/HostedInput";
import { Typography } from "@material-ui/core";

interface OwnProps {
  braintreeInstance: any;
  closeHandler: () => void;
  onSuccess?: (paymentMethodNonce: string) => void;
}

interface StateProps {
  clientToken: string;
  isRequesting: boolean;
}
interface DispatchProps {
}
interface Props extends DispatchProps, OwnProps, StateProps {}

interface State {
  hostedFieldsInstance: any;
  braintreeError: Braintree.BraintreeError;
  isCreating: boolean;
}

class CreditCardForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      hostedFieldsInstance: undefined,
      braintreeError: undefined,
      isCreating: false,
    }
  }

  public componentDidMount() {
    this.props.braintreeInstance && this.initHostedFields();
  }

  public componentDidUpdate(prevProps: Props) {
    const { braintreeInstance } = this.props;
    const { braintreeInstance: prevBraintreeInstance } = prevProps;
    if (!prevBraintreeInstance && braintreeInstance) {
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
            selector: `#${CreditCardFields.cardNumber.name}`,
            placeholder: CreditCardFields.cardNumber.placeholder
          },
          cvv: {
            selector: `#${CreditCardFields.csv.name}`,
            placeholder: CreditCardFields.csv.placeholder
          },
          expirationDate: {
            selector: `#${CreditCardFields.expirationDate.name}`,
            placeholder: CreditCardFields.expirationDate.placeholder,
          },
          postalCode: {
            selector: `#${CreditCardFields.postalCode.name}`,
            placeholder: CreditCardFields.postalCode.placeholder,
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
      this.setState({ isCreating: true });
      hostedFieldsInstance.tokenize(async (err: Braintree.BraintreeError, payload:{ [key: string]: string }) => {
        if (err) {
          this.setState({ braintreeError: err, isCreating: false });
        } else {
          try {
            const response = await postPaymentMethod(payload.nonce);
            const paymentMethodId = response.data;
            this.props.onSuccess && this.props.onSuccess(paymentMethodId);
            this.setState({ isCreating: false, braintreeError: undefined });
          } catch (e) {
            const { errorMessage } = e;
            this.setState({ braintreeError: errorMessage, isCreating: false });
          }
        }
      });
    }
  }

  public render(): JSX.Element {
    const { braintreeError, hostedFieldsInstance, isCreating } = this.state;
    const { isRequesting, braintreeInstance } = this.props;
    const error = braintreeError && (isString(braintreeError) ? braintreeError : braintreeError.message);

    return (
      <>
        <Form
          id="credit-card-form"
          title="Enter your credit or debit card information"
          onSubmit={this.requestPaymentMethod}
          loading={isRequesting || isCreating || !braintreeInstance || !hostedFieldsInstance }
        >
          <HostedInput
            label={CreditCardFields.cardNumber.label}
            id={CreditCardFields.cardNumber.name}
          />
          <Grid container spacing={24}>
            <Grid item xs={6}>
              <HostedInput
                label={CreditCardFields.expirationDate.label}
                id={CreditCardFields.expirationDate.name}
              />
            </Grid>
            <Grid item xs={6}>
              <HostedInput
                label={CreditCardFields.csv.label}
                id={CreditCardFields.csv.name}
              />
            </Grid>
          </Grid>
          <HostedInput
            label={CreditCardFields.postalCode.label}
            id={CreditCardFields.postalCode.name}
          />
          {!isRequesting && error && <ErrorMessage error={error} id="credit-card-error"/>}
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreditCardForm);