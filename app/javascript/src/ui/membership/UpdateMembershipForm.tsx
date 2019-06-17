import * as React from "react";
import { connect } from "react-redux";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import MembershipSelectForm from "ui/membership/MembershipSelectForm";
import Form from "ui/common/Form";
import { Subscription } from "app/entities/subscription";
import { readSubscriptionAction, deleteSubscriptionAction, updateSubscriptionAction } from "ui/subscriptions/actions";
import KeyValueItem from "ui/common/KeyValueItem";
import { displayMemberExpiration } from "ui/member/utils";
import LoadingOverlay from "ui/common/LoadingOverlay";
import MemberStatusLabel from "ui/member/MemberStatusLabel";
import { getDetailsForMember } from "ui/membership/constants";
import { readInvoicesAction } from "ui/invoices/actions";
import { timeToDate } from "ui/utils/timeToDate";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";
import UpdateMembershipContainer, { UpdateSubscriptionRenderProps } from "ui/membership/UpdateMembershipContainer";
import CancelMembershipModal from "ui/membership/CancelMembershipModal";
import { CrudOperation, Routing } from "app/constants";
import { Invoice, InvoiceOptionSelection } from "app/entities/invoice";
import FormModal from "ui/common/FormModal";
import PaymentMethodsContainer from "ui/checkout/PaymentMethodsContainer";
import { push } from "connected-react-router";
import { MemberDetails } from "app/entities/member";
import { readMemberAction } from "ui/member/actions";

/*
View Current Membership Info
If no subscription, can purchase a membership
When selecting a membership & submitting form, create an invoice, and go to checkout

If subscription, can cancel or change payment method
Need to display notification that can only have one subscription active so if they'd like to change
membership then they need to cancel their current one and select a new one.
Changing methods renders PaymentMethodsContainer w/ managing methods false

*/


// Need to determine current membership state
// If has subscription, can cancel or change - change is just a cancel and create
  // Cancelling subscription needs to delete all oustanding invoices for that subscription
  // Creating a subscription will create an invoice for it to be settled automatically
  // Need to watch for payments from subscription in order to settle automatically

  // Also need to support changing payment methods


// If doesn't have subscription, may be month to month or non member
  // If month to month, delete existing invoice & create subscription

  // If non member, going through orig checkout process


interface DispatchProps {
  getSubscription: (id: string) => void;
  getInvoices: () => void;
  getMember: () => void;
  goToCheckout: () => void;
}
interface OwnProps {
  subscriptionId: string;
  member: MemberDetails;
}
interface StateProps {
  subscription: Subscription;
  invoice: Invoice;
  isRequesting: boolean;
  error: string;
  selectedOption: InvoiceOptionSelection;
}
interface Props extends OwnProps, StateProps, DispatchProps {}
interface State {
  openMembershipSelect: boolean;
  openCancelModal: boolean;
  openPaymentMethodModal: boolean;
  paymentMethodId: string;
}

class UpdateMembershipForm extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      openMembershipSelect: false,
      openPaymentMethodModal: false,
      openCancelModal: false,
      paymentMethodId: undefined,
    }
  }

  public componentDidMount() {
    const { subscriptionId, getSubscription, getInvoices } = this.props;
    subscriptionId && getSubscription(subscriptionId);
    getInvoices();
  }


  private openMembershipSelect = () => this.setState({ openMembershipSelect: true });
  private closeMembershipSelect = () => this.setState({ openMembershipSelect: false });
  private openCancelModal = () => this.setState({ openCancelModal: true });
  private closeCancelModal = () => this.setState({ openCancelModal: false });
  private openPaymentMethodForm = () => this.setState({ openPaymentMethodModal: true });
  private closePaymentMethodForm = () => this.setState({ openPaymentMethodModal: false });

  private getSubscriptionOptions = () => {
    const { isRequesting, error } = this.props;
    // TODO: Add support for changing payment method and membership type
    return [
    //   {
    //   id: "subscription-option-update",
    //   color: "primary",
    //   variant: "outlined",
    //   disabled: isRequesting || !!error,
    //   label: "Change Membership",
    //   onClick: this.openMembershipSelect
    // },
    {
      id: "subscription-option-payment-method",
      color: "primary",
      variant: "contained",
      disabled: isRequesting || !!error,
      label: "Change Payment Method",
      onClick: this.openPaymentMethodForm
    },
     {
      id: "subscription-option-cancel",
      color: "secondary",
      variant: "outlined",
      disabled: isRequesting || !!error,
      label: "Cancel Membership",
      onClick: this.openCancelModal
    }] as ActionButton[]
  }



  private renderMembershipForm = () => {
    const { openMembershipSelect, openCancelModal, openPaymentMethodModal, paymentMethodId } = this.state;
    const { invoice, subscription, selectedOption } = this.props;

    // Update can change payment method, subscription type, or create new subscription
    // Creating a new sub means one doesn't already exist
    const onUpdate = (onSubmit: Function) => async (form: Form) => {
      await onSubmit(form);
      if (!subscription) { // Pay if no subscription
        this.props.goToCheckout();
      } else { // Refresh subscription if already exists
        this.props.getSubscription(subscription.id);
      }
    }

    const membershipSelectForm = (renderProps: UpdateSubscriptionRenderProps) => (
      <FormModal
        id="select-membership"
        fullScreen={true}
        formRef={renderProps.setRef}
        isOpen={renderProps.isOpen}
        closeHandler={renderProps.closeHandler}
        onSubmit={onUpdate(renderProps.submit)}
        loading={renderProps.isRequesting}
        error={renderProps.error}
      >
        {this.renderMembershipSelect()}
      </FormModal>
    );

    const onDelete = (onsubmit: Function) => async (form: Form) => {
      await onsubmit(form);
      this.props.getMember();
    }

    const cancellationForm = (renderProps: UpdateSubscriptionRenderProps) => (
      <CancelMembershipModal
        ref={renderProps.setRef}
        subscription={renderProps.subscription}
        invoice={renderProps.invoice}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={onDelete(renderProps.submit)}
      />
    );

    const paymentMethodForm = (renderProps: UpdateSubscriptionRenderProps) => (
      <FormModal
        id="change-payment-method"
        formRef={renderProps.setRef}
        isOpen={renderProps.isOpen}
        closeHandler={renderProps.closeHandler}
        onSubmit={onUpdate(renderProps.submit)}
        loading={renderProps.isRequesting}
        error={renderProps.error}
      >
        <PaymentMethodsContainer
          onPaymentMethodChange={this.updatePaymentMethodId}
          title="Select or add a new payment method"
          subscription={subscription}
        />
      </FormModal>
    );

    return (
      <>
        <UpdateMembershipContainer
          operation={CrudOperation.Update}
          isOpen={openMembershipSelect}
          subscription={subscription}
          discountId={selectedOption && selectedOption.discountId}
          membershipOptionId={selectedOption && selectedOption.invoiceOptionId}
          invoice={invoice}
          closeHandler={this.closeMembershipSelect}
          render={membershipSelectForm}
        />
        {subscription && (
          <>
            <UpdateMembershipContainer
              operation={CrudOperation.Delete}
              isOpen={openCancelModal}
              subscription={subscription}
              invoice={invoice}
              closeHandler={this.closeCancelModal}
              render={cancellationForm}
            />
            <UpdateMembershipContainer
              operation={CrudOperation.Update}
              isOpen={openPaymentMethodModal}
              subscription={subscription}
              paymentMethodToken={paymentMethodId}
              invoice={invoice}
              closeHandler={this.closePaymentMethodForm}
              render={paymentMethodForm}
            />
          </>
        )}
      </>
    );
  }

  private updatePaymentMethodId = (id: string) => this.setState({ paymentMethodId: id });
  private renderMembershipSelect = () => {
    const { openMembershipSelect } = this.state;
    return (openMembershipSelect &&
      <>
        <MembershipSelectForm
          subscriptionOnly={true}
        />
      </>
    )
  }

  private renderSubscriptionDetails = () => {
    const { subscription, invoice } = this.props;

    return (
      <Grid container spacing={24}>
        <Grid item xs={12}>
          { invoice &&
            <>
              <KeyValueItem label="Name">
                <span id="cancel-subscription-name">{invoice.name}</span>
              </KeyValueItem>
              <KeyValueItem label="Description">
                <span id="cancel-subscription-description">{invoice.description}</span>
              </KeyValueItem>
            </>
          }
          <KeyValueItem label="Status">
            <span id="subscription-status">{`${subscription.status}`}</span>
          </KeyValueItem>
          <KeyValueItem label="Next Payment">
            <span id="subscription-next-payment">{timeToDate(subscription.nextBillingDate)}</span>
          </KeyValueItem>
        </Grid>

        <Grid item xs={12}>
          <ButtonRow actionButtons={this.getSubscriptionOptions()}/>
        </Grid>
      </Grid>
    )
  }
  private renderMembershipDetails = () => {
    const { member } = this.props;

    const details = getDetailsForMember(member);

    return (
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <KeyValueItem label="Membership Expiration">
            <span id="member-detail-expiration">{displayMemberExpiration(member)}</span>
          </KeyValueItem>
          <KeyValueItem label="Membership Status">
            <MemberStatusLabel id="member-detail-status" member={member} />
          </KeyValueItem>
          <KeyValueItem label="Membership Type">
            <span id="member-detail-type">{details.type}</span>
          </KeyValueItem>
        </Grid>
        <Grid item xs={12}>
          <Typography>{details.description}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Button 
            id="settings-create-membership-button"
            variant="contained" 
            disabled={!details.allowMod} 
            onClick={this.openMembershipSelect}
          >
            {member.expirationTime ? "Update Membership" : "Create Membership"}
          </Button>
        </Grid>
      </Grid>
    );
  }

  public render = () => {
    const { subscription, isRequesting } = this.props;
    return (
      <Form
        id="update-membership-modal"
        title="Membership"
      >
        {isRequesting ? <LoadingOverlay id="update-membership-modal-loading" contained={true}/>
          : (subscription ? this.renderSubscriptionDetails() : this.renderMembershipDetails())
        }
        {this.renderMembershipForm()}
      </Form>
    )
  }
}


const mapStateToProps = (
  state: ReduxState,
  ownProps: OwnProps
): StateProps => {

  const { subscriptionId } = ownProps;
  const { selectedOption } = state.billing;
  const { entities: subscriptions, read: { isRequesting: subscriptionsLoading, error: subscriptionError } } = state.subscriptions;
  const { entities: invoices, read: {isRequesting: invoicesLoading, error: invoicesError }} = state.invoices;
  const subscription = subscriptions[subscriptionId];
  const invoice = Object.values(invoices).find(invoice => invoice.subscriptionId === subscriptionId);

  return {
    invoice,
    subscription,
    selectedOption,
    isRequesting: subscriptionsLoading || invoicesLoading,
    error: subscriptionError || invoicesError,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps,
): DispatchProps => {
  const { member, subscriptionId } = ownProps;
  return {
    getSubscription: () => dispatch(readSubscriptionAction(subscriptionId)),
    getMember: () => dispatch(readMemberAction(member.id)),
    getInvoices: () => dispatch(readInvoicesAction(false, { resourceId: member.id })),
    goToCheckout: () => dispatch(push(Routing.Checkout)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateMembershipForm);