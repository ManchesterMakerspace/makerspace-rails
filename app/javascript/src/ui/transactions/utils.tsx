import * as React from "react";
import { Transaction, TransactionStatus } from "app/entities/transaction";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";

export const renderTransactionStatus = (transaction: Transaction) => {
  let label = "In Progress";
  let color = Status.Info;

  switch (transaction.status) {
    case TransactionStatus.Settled:
      color = Status.Success;
      label = "Paid";
      break;
    case TransactionStatus.Failed:
    case TransactionStatus.Declined:
    case TransactionStatus.Rejected:
    case TransactionStatus.Voided:
      color = Status.Danger;
      label = "Failed";
      break;
    case TransactionStatus.Unknown:
      color = Status.Warn;
      label = "Unknown";
  }

  return (
    <StatusLabel label={label} color={color}/>
  );
}