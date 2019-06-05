import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Form from "ui/common/Form";

//@ts-ignore
import * as Braintree from "braintree-web";
import { PaymentMethodType } from "app/entities/paymentMethod";

import { getClientToken } from "api/paymentMethods/transactions";

import CreditCardForm from "ui/checkout/CreditCardForm";
import PaypalButton from "ui/checkout/PaypalButton";
import FormModal from "ui/common/FormModal";


interface OwnProps {
  closeHandler: () => void;
  onSuccess: (paymentMethodNonce: string) => void;
  isOpen: boolean;
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
  methodLoading: boolean;
}

const defaultState: State = {
  braintreeError: undefined,
  paymentMethodNonce: undefined,
  braintreeInstance: undefined,
  braintreeRequesting: false,
  paymentMethodType: undefined,
  clientToken: undefined,
  requestingClientToken: false,
  clientTokenError: "",
  methodLoading: false,
};

class PaymentMethodForm extends React.Component<Props, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  constructor(props: Props) {
    super(props);

    this.state = { ...defaultState };
  }

  public componentDidUpdate(prevProps: Props) {
    const { isOpen: wasOpen } = prevProps;
    if (!wasOpen && this.props.isOpen) {
      this.getClientToken();
      this.setState({ ...defaultState });
    }
  }

  private getClientToken = async () => {
    this.setState({ requestingClientToken: true });

    let token;
    let error = "";
    try {
      const response = await getClientToken();
      token = response.data.clientToken;
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

  private selectCC = () => this.setState({ paymentMethodType: PaymentMethodType.CreditCard });

  private toggleMethodLoading = (on: boolean) => {
    this.setState({ methodLoading: on });
  }

  private renderPaymentMethod = () => {
    const { braintreeInstance, paymentMethodType, clientToken } = this.state;
    const { onSuccess, closeHandler } = this.props;

    switch (paymentMethodType) {
      case PaymentMethodType.CreditCard:
        return (
          <CreditCardForm
            toggleLoading={this.toggleMethodLoading}
            closeHandler={closeHandler}
            braintreeInstance={braintreeInstance}
            clientToken={clientToken}
            onSuccess={onSuccess}
          />
        );
      default:
        return <></>;
    }
  }

  public render(): JSX.Element {
    const { paymentMethodType } = this.state;

    const { braintreeError, braintreeInstance, clientToken, requestingClientToken, clientTokenError, braintreeRequesting, methodLoading } = this.state;
    const error = clientTokenError || (braintreeError && braintreeError.message);
    const { isOpen, closeHandler } = this.props;
    const loading = requestingClientToken || braintreeRequesting || methodLoading;

    return (
      <FormModal
        id="payment-method-form"
        title={!paymentMethodType && "Select a payment method type"}
        formRef={this.setFormRef}
        isOpen={isOpen}
        closeHandler={!paymentMethodType ? closeHandler : undefined}
        loading={loading}
        error={error}
      >
        {paymentMethodType ? (
          this.renderPaymentMethod()
        ) : (
          <Grid container justify="center" spacing={16}>
            <Grid item xs={12} md={6}>
              <Button fullWidth variant="outlined" onClick={this.selectCC} id="card-payment">
                Credit or debit card
              </Button>
            </Grid>
            <Grid item xs={12}>
              <PaypalButton
                clientToken={clientToken}
                braintreeInstance={braintreeInstance}
                paymentMethodCallback={closeHandler}
              />
            </Grid>
          </Grid>
        )}
      </FormModal>
    );
  }
}

export default PaymentMethodForm;
