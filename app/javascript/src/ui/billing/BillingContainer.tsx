import * as React from "react";
import { Routing } from "app/constants";
import DetailView from "ui/common/DetailView";
import SubscriptionsList from "ui/subscriptions/SubscriptionsList";
import TransactionsList from "ui/transactions/TransactionsList";
import OptionsList from "ui/billing/OptionsList";

interface StateProps {}
interface DispatchProps {}
interface OwnProps {}
interface Props extends StateProps, DispatchProps, OwnProps {}
interface State {}

class BillingContainer extends React.Component<Props, State> {

  public componentDidMount() {
    // Fetch member stats
  }

  private renderBillingInfo = () => {
    return (
      <>
        Statistics to be rendered here.
        {/* TODO <KeyValueItem label="Number of Members">100</KeyValueItem>
        <KeyValueItem label="Number of Members on Subscription">100</KeyValueItem>
        <KeyValueItem label="Number of Rentals">100</KeyValueItem>
        <KeyValueItem label="Active Membership">100</KeyValueItem> */}
      </>
    )
  }
  public render(): JSX.Element {
    return (
      <DetailView
        title="Billing Central"
        basePath={Routing.Billing}
        information={this.renderBillingInfo()}
        actionButtons={[]}
        resources={[
          {
            name: "subscriptions",
            content: (
              <SubscriptionsList/>
            )
          }, {
            name: "transactions",
            content: (
              <TransactionsList />
            )
          }, {
            name: "options",
            displayName: "Billing Options",
            content: (
              <OptionsList />
            )
          }
        ]}
      />
    )
  }
}

export default BillingContainer;