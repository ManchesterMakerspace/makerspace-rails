import * as React from "react";
import { connect } from "react-redux";

//@ts-ignore
import * as Braintree from "braintree-web-drop-in";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { getClientTokenAction } from "ui/checkout/actions";
import { readPlansAction } from "ui/billingPlans/actions";

interface OwnProps {}
interface StateProps {
  clientToken: string;
  isRequesting: boolean;
}
interface DispatchProps {
  getPlans: () => void;
  getClientToken: () => void;
}
interface Props extends DispatchProps, OwnProps, StateProps {}

interface State {
  braintreeInstance: Braintree
  braintreeError: string;
}
class CheckoutForm extends React.Component<Props, State> {

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isRequesting, clientToken } = this.props;

    if (wasRequesting && !isRequesting && !!clientToken) {
      this.initBraintree();
    }
  }

  private initBraintree = async () => {
    const { clientToken } = this.props;
    let braintreeInstance;

    try {
      braintreeInstance = await Braintree.dropin.create({
        authorization: clientToken,
        container: "#dropin-container",
        paypal: {
          flow: "vault"
        }
      });
      this.setState({ braintreeInstance });
    } catch (e) {
      this.setState({ braintreeError: e });
    }
  }

  public render(): JSX.Element {
    return (
      <div id="dropin-container"></div>
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutForm);