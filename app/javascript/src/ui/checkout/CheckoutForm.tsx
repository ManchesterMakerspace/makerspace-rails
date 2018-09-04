import * as React from "react";
import { connect } from "react-redux";

//@ts-ignore
import * as Braintree from "braintree-web";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { getClientTokenAction } from "ui/checkout/actions";
import CreditCardForm from "ui/checkout/CreditCardForm";

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

  public render(): JSX.Element {
    const { braintreeError, braintreeInstance } = this.state;
    const { isRequesting } = this.props;
    return (
      <CreditCardForm
        braintreeInstance={braintreeInstance}
      />
    );
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