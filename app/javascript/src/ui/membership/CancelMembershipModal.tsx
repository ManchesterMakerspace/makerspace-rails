import * as React from "react";
import Typography from "@material-ui/core/Typography";

import { Rental } from "app/entities/rental";
import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import Form from "ui/common/Form";
import { Subscription } from "app/entities/subscription";
import { Invoice } from "app/entities/invoice";
import { timeToDate } from "ui/utils/timeToDate";

interface OwnProps {
  subscription: Partial<Subscription>;
  invoice: Partial<Invoice>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}


class CancelMembershipModal extends React.Component<OwnProps, {}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, subscription, invoice } = this.props;

    return subscription ? (
      <FormModal
        formRef={this.setFormRef}
        id="cancel-subscription"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title="Cancel Membership"
        onSubmit={onSubmit}
        submitText="Submit"
        cancelText="Close"
        error={error}
      >
        <Typography gutterBottom>
          Are you sure you want to cancel your recurring membership?  This action cannot be undone.
        </Typography>
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
          <span id="cancel-subscription-status">{`${subscription.status}`}</span>
        </KeyValueItem>
        <KeyValueItem label="Next Payment">
          <span id="cancel-subscription-next-payment">{timeToDate(subscription.nextBillingDate)}</span>
        </KeyValueItem>
      </FormModal>
    ) : null;
  }
}

export default CancelMembershipModal;
