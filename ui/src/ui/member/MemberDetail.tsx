import * as React from "react";
import { Link } from "react-router-dom";
import useReactRouter from "use-react-router";
import { Member, getMember, listRentals } from "makerspace-ts-api-client";

import { displayMemberExpiration } from "ui/member/utils";
import LoadingOverlay from "ui/common/LoadingOverlay";
import KeyValueItem from "ui/common/KeyValueItem";
import DetailView from "ui/common/DetailView";
import MemberStatusLabel from "ui/member/MemberStatusLabel";
import InvoicesList from "ui/invoice/InvoicesList";
import RentalsList from "ui/rentals/RentalsList";
import { ActionButton } from "ui/common/ButtonRow";
import { Whitelists, Routing } from "app/constants";
import { getDetailsForMember } from "./constants";
import AccessCardForm from "ui/accessCards/AccessCardForm";
import ReportList from "ui/reports/ReportList";
import TransactionsList from "ui/transactions/TransactionsList";
import useReadTransaction from "../hooks/useReadTransaction";
import { useAuthState } from "../reducer/hooks";
import EditMember from "./EditMember";
import RenewMember from "./RenewMember";
import NotificationModal, { Notification } from "./NotificationModal";
import PreviewMemberContract from "../documents/PreviewMemberContract";
import { SubRoutes } from "ui/settings/SettingsContainer";
import { SubscriptionFilter } from "../subscriptions/SubscriptionFilters";
import { useSearchQuery, useSetSearchQuery } from "hooks/useSearchQuery";

const MemberProfile: React.FC = () => {
  const { match: { params: { memberId, resource } }, history } = useReactRouter<{ memberId: string, resource: string }>();
  const { currentUser: { id: currentUserId, isAdmin }, permissions } = useAuthState();

  const {
    isNewMember
  } = useSearchQuery({
    isNewMember: "newMember"
  });

  // State for tracking initial render to address bug displaying notifications
  const [initRender, setInitRender] = React.useState(true);
  React.useEffect(() => setInitRender(false), []);

  const isOwnProfile = currentUserId === memberId;
  const billingEnabled = !!permissions[Whitelists.billing];

  const goToSettings = React.useCallback(() => {
    history.push(Routing.Settings.replace(Routing.PathPlaceholder.MemberId, currentUserId));
  }, [currentUserId]);

  const {
    isRequesting: memberLoading,
    refresh: refreshMember,
    error: memberError,
    data: member = {} as Member
  } = useReadTransaction(getMember, { id: memberId });

  const [notification, setNotification] = React.useState<Notification>();
  React.useEffect(() => {
    if (!initRender && isOwnProfile && !memberLoading && member.id) {
      if (isNewMember || !member.memberContractOnFile) {
        setNotification(member.memberContractOnFile ? Notification.Welcome : Notification.WelcomeNeedContract);
      } else if (!(member.address && member.address.street)) {
        setNotification(Notification.IdentifcationDetails);
      }
    }
  }, [initRender, isOwnProfile, memberLoading]);

  const { data: rentals = [], isRequesting: rentalsLoading } = useReadTransaction(listRentals, {}, undefined, "listRentals");

  React.useEffect(() => {
    const missingAgreement = rentals.find(rental => !rental.contractOnFile);
    if (!initRender && isOwnProfile && !rentalsLoading && missingAgreement && !notification) {
      setNotification(Notification.SignRental)
    }
  }, [initRender, isOwnProfile, rentals]);

  const { customerId, earnedMembershipId } = member;
  const isEarnedMember = !!earnedMembershipId && (isOwnProfile || isAdmin);

  const setSearchQuery = useSetSearchQuery();
  const closeNotification = React.useCallback(() => {
    setSearchQuery({ newMember: "" });
    setNotification(undefined);
    refreshMember();
  }, [refreshMember, setNotification]);

  const goToAgreements = React.useCallback(() => {
    switch (notification) {
      case Notification.SignRental:
        const missingAgreement = rentals.find(rental => !rental.contractOnFile);
        if (missingAgreement) {
          history.push(
            Routing.Documents
              .replace(Routing.PathPlaceholder.Resource, "rental")
              .replace(Routing.PathPlaceholder.ResourceId, missingAgreement.id)
          );
          break;
        }
      case Notification.WelcomeNeedContract:
        history.push(
          Routing.Documents
            .replace(Routing.PathPlaceholder.Resource, "membership")
            .replace(Routing.PathPlaceholder.ResourceId, "")
        );
        break;
      case Notification.Welcome:
        closeNotification();
        break;
      case Notification.IdentifcationDetails:
        goToSettings();
        break;
    }
  }, [history, rentals, notification, goToSettings, closeNotification]);

  React.useEffect(() => {
    if (memberError && !member.id) {
      history.push(Routing.Members);
    }
  }, [memberError, member.id, history]);

  if (!member.id) {
    return <LoadingOverlay />;
  }

  const memberSubscription = getDetailsForMember(member);

  return (
    <>
      <DetailView
        title={`${member.firstname} ${member.lastname}`}
        basePath={`/members/${memberId}`}
        actionButtons={[
          ...isOwnProfile ? [
            <ActionButton
              key="open-settings"
              id="member-detail-open-settings"
              color="primary"
              variant="outlined"
              disabled={memberLoading}
              label="Account Settings"
              onClick={goToSettings}
            />] : [],
          ...isAdmin ? [
            <EditMember member={member} key="edit-member" onEdit={refreshMember}/>,
            <RenewMember member={member} key="renew-member" onRenew={refreshMember}/>,
            <AccessCardForm memberId={memberId} key="card-form"/>
          ] : []
        ]}
        information={(
          <>
            <KeyValueItem label="Email">
              {member.email ? <a id="member-detail-email" href={`mailto:${member.email}`}>{member.email}</a> : "N/A"}
            </KeyValueItem>
            <KeyValueItem  label="Membership Expiration">
              <span id="member-detail-expiration">{displayMemberExpiration(member)}</span>
            </KeyValueItem>
            <KeyValueItem label="Membership Status">
              <MemberStatusLabel id="member-detail-status" member={member} />
            </KeyValueItem>
            {billingEnabled && <KeyValueItem label="Membership Type">
              <span id="member-detail-type" style={{ marginRight: "1em" }}>{memberSubscription.type}</span>
                {member.subscriptionId && (
                  <span style={{ display: "inline-block", marginRight: "1em" }}>
                    {isOwnProfile && (
                      <Link to={`${Routing.Settings.replace(Routing.PathPlaceholder.MemberId, member.id)}/${SubRoutes.Subscriptions}`}>
                        Manage Subscription
                      </Link>
                    )}
                    {!isOwnProfile && isAdmin && (
                        <Link to={
                          `${
                            Routing.Billing}/${
                              SubRoutes.Subscriptions}?q=${
                                encodeURIComponent(`${member.subscriptionId}`)
                              }&${SubscriptionFilter.Status}=all`
                        }>
                          Manage Subscription
                        </Link>
                    )}
                  </span>
                )}
                {isAdmin && member.customerId && (
                  <a target="blank" href={`https://www.braintreegateway.com/merchants/vfx5f27bnwwjjyqx/customers/${member.customerId}`}>
                    View in Braintree
                  </a>
                )}
            </KeyValueItem>}
            {member.notes && <KeyValueItem label="Notes">
              <div id="member-detail-notes" className="preformatted">{member.notes}</div>
            </KeyValueItem>}
            {isOwnProfile && <PreviewMemberContract />}
          </>
        )}
        activeResourceName={resource}
        resources={(isOwnProfile || isAdmin) && [
          ...isEarnedMember ?
          [{
            name: "membership",
            content: <ReportList earnedMembershipId={earnedMembershipId}/>
          }] : [],
          ...billingEnabled ?
          [{
            name: "dues",
            content: <InvoicesList />
          }] : [],
          {
            name: "rentals",
            content: <RentalsList member={member}/>
          },
          ...billingEnabled && !!customerId ? [{
            name: "transactions",
            displayName: "Payment History",
            content: <TransactionsList member={member} />
          }] : []
        ]}
      />
      {notification && <NotificationModal
        notification={notification}
        onSubmit={goToAgreements}
        onClose={closeNotification}
      />}
    </>
  )
};

export default MemberProfile;
