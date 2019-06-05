import * as React from "react";
import Typography from "@material-ui/core/Typography";

import { Transaction } from "app/entities/transaction";
import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import Form from "ui/common/Form";
import { timeToDate } from "ui/utils/timeToDate";

interface OwnProps {
  transaction: Partial<Transaction>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  isAdmin: boolean;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}


class DeleteTransactionModal extends React.Component<OwnProps, {}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  private getAdminContent = () => {
    const { transaction } = this.props;
    return (
      <>
        <Typography gutterBottom>
          Are you sure you want to refund this transaction?
        </Typography>
        <KeyValueItem label="Date">
          <span id="refund-transaction-date">{timeToDate(transaction.createdAt)}</span>
        </KeyValueItem>
        <KeyValueItem label="Amount">
          <span id="refund-transaction-amount">{(Number(transaction.amount) - Number(transaction.discountAmount))}</span>
        </KeyValueItem>
        { transaction.invoice && 
          <>
            <KeyValueItem label="Member">
              <span id="refund-transaction-member">{transaction.invoice.memberName}</span>
            </KeyValueItem>
            <KeyValueItem label="Description">
              <span id="refund-transaction-description">{transaction.invoice.description}</span>
            </KeyValueItem>
          </>
        }
      </>
    )
  }

  private getMemberContent = () => {
    const { transaction } = this.props;
    return (
      <>
        <Typography gutterBottom>
          Would you like to request a refund for this transaction?

          An administrator will review the request and notify you of a decision. Please note, requests for refunds are evaluated on a case by case basis and are not guaranteed.
        </Typography>
        <KeyValueItem label="Date">
          <span id="refund-transaction-date">{timeToDate(transaction.createdAt)}</span>
        </KeyValueItem>
        <KeyValueItem label="Amount">
          <span id="refund-transaction-amount">{(Number(transaction.amount) - Number(transaction.discountAmount))}</span>
        </KeyValueItem>
        <KeyValueItem label="Description">
          <span id="refund-transaction-description">{transaction.invoice.description}</span>
        </KeyValueItem>
      </>
    )
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, transaction, isAdmin } = this.props;

    const title = isAdmin ? "Refund Transaction" : "Request Refund";

    return transaction ? (
      <FormModal
        formRef={this.setFormRef}
        id="refund-transaction"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={title}
        onSubmit={onSubmit}
        error={error}
      >
        {isAdmin ? this.getAdminContent() : this.getMemberContent()}
      </FormModal>
    ) : null;
  }
}

export default DeleteTransactionModal;
