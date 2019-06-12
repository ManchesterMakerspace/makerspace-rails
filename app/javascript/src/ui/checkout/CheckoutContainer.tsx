import * as React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import isEmpty from "lodash-es/isEmpty";

import { Invoice } from "app/entities/invoice";
import { Routing } from "app/constants";
import { CollectionOf, RequestStatus } from "app/interfaces";

import { submitPaymentAction } from "ui/checkout/actions";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import CheckoutPage from "ui/checkout/CheckoutPage";

import { buildProfileRouting } from "ui/member/utils";
import { Transaction } from "app/entities/transaction";
import { Action } from "ui/checkout/constants";

interface OwnProps {}
interface StateProps {
  invoices: CollectionOf<Invoice>;
  transactions: CollectionOf<Transaction & RequestStatus>;
  userId: string;
  error: string;
  isRequesting: boolean;
  transactionsLoading: boolean;
  transactionsError: { [key: string]: string }; // Keys are invoice keys too
}
interface DispatchProps {
  submitCheckout: (invoices: Invoice[], paymentMethodId: string) => void;
  pushLocation: (location: string) => void;
  resetCheckoutState: () => void;
}
interface Props extends OwnProps, StateProps, DispatchProps {}
interface State {
  transactionsComplete: boolean;
}

class CheckoutContainer extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      transactionsComplete: false
    }
  }

  public componentDidMount() {
    // Redirect if there are no invoices to checkout
    const { userId, invoices } = this.props;
    const redirectPath = userId ? buildProfileRouting(userId) : Routing.Login;
    const redirect = invoices && isEmpty(invoices) ? redirectPath : undefined;
    if (redirect) {
      console.warn("Illegal transition to checkout detected. Transitioning")
      this.props.pushLocation(redirectPath);
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting, error, invoices, transactions, userId, transactionsLoading, transactionsError } = this.props;
    const { isRequesting: wasRequesting, transactionsLoading: wasTransacting } = prevProps;
    if (wasRequesting && !isRequesting && !error) {
      // If there are no invoices, redirect to profile since there's nothing to do here
      if (isEmpty(invoices)) {
        this.props.pushLocation(buildProfileRouting(userId));
      }
    }

    if (wasTransacting && !transactionsLoading && isEmpty(transactionsError) && !isEmpty(transactions)) {
      // Update state so component unmounts correctly
      this.setState({ transactionsComplete: true }, () => this.props.pushLocation(Routing.Receipt));
    }
  }

  public componentWillUnmount() {
    if (!this.state.transactionsComplete) {
      this.props.resetCheckoutState();
    }
  }

  private submitPayment = (paymentMethodId: string) => {
    const { invoices } = this.props;
    if (!paymentMethodId) {
      return;
    }
    this.props.submitCheckout(Object.values(invoices), paymentMethodId);
  }

  public render(): JSX.Element {
    const { isRequesting, error, invoices, transactionsError } = this.props;

    return (
      <CheckoutPage
        onSubmit={this.submitPayment}
        isRequesting={isRequesting}
        error={error || transactionsError}
        invoices={invoices}
      />
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const { invoices, transactions, isRequesting, error } = state.checkout;
  const { currentUser: { id: userId } } = state.auth;

  const transactionsLoading = Object.values(transactions).some(transaction => transaction.isRequesting);
  const transactionsError = Object.entries(transactions).reduce((list, [key, { error }]) => {
    if (error) {
      list[key] = error;
    }
    return list;
  }, {});

  return {
    invoices,
    transactions,
    userId,
    isRequesting,
    error,
    transactionsLoading,
    // Only set error on this page if all transactions errored out
    transactionsError: Object.keys(transactionsError).length === Object.keys(transactions).length && transactionsError
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    submitCheckout: (invoices, paymentMethodId) => dispatch(submitPaymentAction(paymentMethodId, invoices)),
    pushLocation: (location) => dispatch(push(location)),
    resetCheckoutState: () => dispatch({ type: Action.ResetStagedInvoices }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutContainer);
