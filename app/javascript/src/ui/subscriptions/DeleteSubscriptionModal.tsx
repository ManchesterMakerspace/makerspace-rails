import * as React from "react";
import Typography from "@material-ui/core/Typography";

import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import Form from "ui/common/Form";
import { timeToDate } from "ui/utils/timeToDate";
import { Subscription } from "app/entities/subscription";

interface OwnProps {
  subscription: Partial<Subscription>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}


class DeleteSubscription extends React.Component<OwnProps, {}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, subscription } = this.props;

    return subscription ? (
      <FormModal
        formRef={this.setFormRef}
        id="delete-subscription-confirm"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title="Delete Subscription"
        onSubmit={onSubmit}
        submitText="Delete"
        error={error}
      >
        <Typography gutterBottom>
          Are you sure you want to cancel this subscription?  This action cannot be undone.
        </Typography>
        <KeyValueItem label="Member">
          <span id="delete-subscription-member">{subscription.memberName}</span>
        </KeyValueItem>
        <KeyValueItem label="Type">
          <span id="delete-subscription-resource">{`$${subscription.resourceClass}`}</span>
        </KeyValueItem>
        <KeyValueItem label="Status">
          <span id="delete-subscription-status">{`$${subscription.resourceClass}`}</span>
        </KeyValueItem>
        <KeyValueItem label="Next Payment">
          <span id="delete-subscription-next-payment">{timeToDate(subscription.nextBillingDate)}</span>
        </KeyValueItem>
      </FormModal>
    ) : null;
  }
}

export default DeleteSubscription;
