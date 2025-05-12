import * as React from "react";

import { Transaction } from "makerspace-ts-api-client";
import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import { timeToDate } from "ui/utils/timeToDate";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { useAuthState } from "../reducer/hooks";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";
import { getTransactionDescription } from "./utils";
import { DocumentInternalFrame } from "../documents/Document";
import { buildReceiptUrl } from "../checkout/Receipt";

interface OwnProps {
  transaction: Transaction;
}

const ViewTransactionModal: React.FC<OwnProps> = ({ transaction = {} as Transaction }) => {
  const { currentUser: { isAdmin } } = useAuthState();
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      <ActionButton
        label="View Transaction"
        id={"transactions-list-view"}
        variant={"outlined"}
        color={"secondary"}
        onClick={openModal}
      />
      {isOpen && (
        <FormModal
          id="refund-transaction"
          isOpen={isOpen}
          closeHandler={closeModal}
          title={getTransactionDescription(transaction)}
        >
          {transaction.invoice ?
            <DocumentInternalFrame id="view-transaction-frame" style={{ width: "100%" }} src={buildReceiptUrl(transaction.invoice.id, isAdmin)} />
          : (<>
              <KeyValueItem label="Date">
                <span id="refund-transaction-date">{timeToDate(transaction.createdAt)}</span>
              </KeyValueItem>
              <KeyValueItem label="Amount">
                <span id="refund-transaction-amount">{numberAsCurrency(Number(transaction.amount) - Number(transaction.discountAmount))}</span>
              </KeyValueItem>
              { isAdmin && transaction.memberName &&
                <KeyValueItem label="Member">
                  <span id="refund-transaction-member">{transaction.memberName}</span>
                </KeyValueItem>}
            </>)}
        </FormModal>
      )}
    </>
  )
}

export default ViewTransactionModal;
