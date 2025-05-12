import * as React from "react";
import useReactRouter from "use-react-router";
import Grid from "@material-ui/core/Grid";

import { listInvoices, Invoice, message } from "makerspace-ts-api-client";

import useReadTransaction from "../hooks/useReadTransaction";
import { isInvoiceSettled } from "../invoice/utils";
import FormModal from "../common/FormModal";
import { buildProfileRouting } from "../member/utils";
import { useAuthState } from "../reducer/hooks";
import { useUUID } from "../hooks/useUUID";
import { Link } from "@material-ui/core";
import { Routing } from "app/constants";
import useWriteTransaction from "ui/hooks/useWriteTransaction";

const DuplicateMembershipModal: React.FC = () => {
  const uuid = useUUID();
  const { data: invoices = [] } = useReadTransaction(listInvoices, {
    resourceClass: ["member"],
    settled: false
  }, undefined, uuid);
  const { currentUser: { id: currentUserId, email, subscriptionId, subscription } } = useAuthState();
  const [blockingMemberInvoice, setBlockingMemberInvoice] = React.useState<Invoice>();

  const { history } = useReactRouter();
  const goToProfile = React.useCallback(() => history.push(buildProfileRouting(currentUserId)), [history, currentUserId]);
  React.useEffect(() => {
    const blockingMemberInvoice = invoices.find(invoice => !!invoice.subscriptionId);
    setBlockingMemberInvoice(blockingMemberInvoice);
  }, [invoices]);

  const { call: reportError } = useWriteTransaction(message);

  React.useEffect(() => {
    if (blockingMemberInvoice && !subscriptionId) {
      reportError({ body: { message: "User has blocking invoice but no subscription ID" }});
    }
  }, [blockingMemberInvoice, subscriptionId]);

  const isPayPal = subscription && !subscriptionId;

  return (blockingMemberInvoice || isPayPal) && (
    <FormModal
      id="outstanding-invoice"
      onSubmit={goToProfile}
      closeHandler={() => setBlockingMemberInvoice(undefined)}
      cancelText="Ignore"
      submitText="View Dues"
      title="Existing Dues Found"
      isOpen={true}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          Our system shows you have already purchased a recurring membership.
          Your account, {email}, can only manage one membership at a time.
          <br />
          If you would like to change your membership, you must first cancel
          the existing one&nbsp;
          {isPayPal ? (
            <>
              tied to your PayPal account. For assistance, please see&nbsp;
              <Link
                href={"https://wiki.manchestermakerspace.org/digital-makerspace/manage-membership#cancel-membership-subscription"}
                target="_blank"
              >
                our wiki.&nbsp;
              </Link>
              Since PayPal subscriptions are not compatible with our touchless renewal system, we strongly recommend
              you cancel your PayPal membership and purchase a new one with the system in this site. The new system will
              automatically renew your key fob when we receive a payment.
            </>
          ) : (
            <>
              via&nbsp;
              <Link
                href={Routing.Settings.replace(Routing.PathPlaceholder.MemberId, currentUserId)}
                target="_blank"
              >
                Account Settings.&nbsp;
              </Link>
            </>
          )}
          Any time left on your current membership will remain after cancellation.
          Purchasing a new membership afterwards will simply extend your current membership based on the new membership term.
        </Grid>
        <Grid item xs={12}>
          If you just signed up, your membership will activate once you receive your key.
        </Grid>
        <Grid item xs={12}>
          If you would like to purchase a membership for someone else, you must create a separate account.
        </Grid>
        <Grid item xs={12}>
          Would you like to view your pending membership dues?
        </Grid>
        <Grid item xs={12}>
          If you're having trouble with your dues, please don't hesitate to <a href="mailto:contact@manchestermakerspace.org">contact us</a>.
        </Grid>
      </Grid>
    </FormModal>
  )
};

export default DuplicateMembershipModal;
