import * as React from "react";
import { Routing } from "app/constants";
import DetailView from "ui/common/DetailView";
import SubscriptionsList from "ui/subscriptions/SubscriptionsList";
import TransactionsList from "ui/transactions/TransactionsList";
import OptionsList from "ui/billing/OptionsList";
import BillingContextContainer from "./BillingContextContainer";
import KeyValueItem from "../common/KeyValueItem";
import useReadTransaction from "../hooks/useReadTransaction";
import { adminListAnalytics } from "makerspace-ts-api-client";
import LoadingOverlay from "../common/LoadingOverlay";
import ErrorMessage from "../common/ErrorMessage";


const BillingContainer: React.FC = () => {
  const { 
    isRequesting, 
    data, 
    error 
  } = useReadTransaction(adminListAnalytics, {}, undefined, "adminListAnalytics");

  const {
    totalMembers,
    newMembers,
    subscribedMembers,
    pastDueInvoices,
    refundsPending
  } = data || {}; 

  const fallbackUI = (isRequesting && <LoadingOverlay id="plans-loading" contained={true} />)
    || (error && <ErrorMessage error={error} />);


  return (
    <BillingContextContainer>
      <DetailView
        title="Billing Central"
        basePath={Routing.Billing}
        information={
          fallbackUI || (
            <>
              <KeyValueItem label="Number of Members">{String(totalMembers)}</KeyValueItem>
              <KeyValueItem label="New Members (Prior 30 days)">{String(newMembers)}</KeyValueItem>
              <KeyValueItem label="Number of Members on Subscription">{String(subscribedMembers)}</KeyValueItem>
              <KeyValueItem label="Number of Past Due Invoices">{String(pastDueInvoices)}</KeyValueItem>
              <KeyValueItem label="Number of Refunds Pending">{String(refundsPending)}</KeyValueItem>
            </>
          )
        }
        actionButtons={[]}
        resources={[
          {
            name: "options",
            displayName: "Billing Options",
            content: <OptionsList />
          },
          {
            name: "subscriptions",
            content: <SubscriptionsList />
          },
          {
            name: "transactions",
            content: <TransactionsList />
          },
        ]}
      />
    </BillingContextContainer>
  );
}

export default BillingContainer;