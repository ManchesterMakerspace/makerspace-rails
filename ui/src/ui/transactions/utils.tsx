import * as React from "react";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";
import { Transaction, TransactionStatusEnum } from "makerspace-ts-api-client";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";

export const renderTransactionStatus = (transaction: Transaction) => {
  let label = "Pending";
  let color = Status.Info;
  console.error("transaction.stat", transaction.status);

  switch (transaction.status) {
    case TransactionStatusEnum.Settled:
      color = Status.Success;
      label = "Successful";
      break;
    case "submitted_for_settlement" as TransactionStatusEnum:
      color = Status.Warn;
      label = "Pending";
      break;
    case TransactionStatusEnum.Failed:
    case TransactionStatusEnum.ProcessorDeclined:
    case TransactionStatusEnum.SettlementDeclined:
    case TransactionStatusEnum.GatewayRejected:
    case TransactionStatusEnum.Voided:
      color = Status.Danger;
      label = "Failed";
      break;
    default:
      color = Status.Warn;
      label = "Unknown";
      break;
  }

  return (
    <StatusLabel label={label} color={color}/>
  );
}

export const getTransactionDescription = (transaction: Transaction) => {
  let description = "";
  if (transaction.refundedTransactionId) {
    description +=  "Refund"
  } else if (transaction.subscriptionId) {
    description += "Subscription Payment"
  } else {
    description += "Standard Payment"
  }

  if (transaction.invoice) {
    description += ` for ${transaction.invoice.name}`;
  }

  return description;
}

const sumColumn = (data: Array<string[]>, index: number) => {
  return data.reduce((total, row) => {
    return total + Number(row[index]);
  }, 0);  
}

const titleRows = [
  ["Manchester Makerspace Transaction Report"],
]

const headerRow = [
  "ID",
  "Member Name",
  "Date",
  "Amount"
];

const numDiscountColumns = 2;
const numStaticColumns = 3;

export const writeReport = (transactions: Transaction[], reportName: string) => {
  let maxDiscounts = 0;

  const transactionRows = transactions.map((transaction) => {
    const numDiscounts = transaction.discounts?.length || 0;

    if (numDiscounts > maxDiscounts) {
      maxDiscounts = numDiscounts;
    }

    return [
      transaction.id,
      transaction.memberName,
      new Date(transaction.createdAt).toLocaleString().replace(",", ""),
      transaction.amount,
      ...(numDiscounts ? transaction.discounts.reduce((discountColumns, discount) => {
        return [
          ...discountColumns,
          discount.name,
          discount.amount
        ];
      }, []) : [])
    ];
  });

  const maxDiscountArray = new Array(maxDiscounts * numDiscountColumns).fill(undefined);

  const csv = [
    [titleRows.join(",")],
    ["Date Run:", new Date().toLocaleString().replace(",", "")],
    [],
    [...headerRow, ...maxDiscounts ? maxDiscountArray.map((_, index) => {
      const discountColumn = Math.round((index + 1) / numDiscountColumns);
      
      if (index % 2) {
        return `Discount ${discountColumn} Amount`
      }

      return `Discount ${discountColumn} Name`
    }): []].join(","),
    transactionRows.join(","),
    [],
    `TOTAL:,,,${sumColumn(transactionRows, numStaticColumns)},${
      (maxDiscounts ? maxDiscountArray.map((_, index) => {
        if (index % 2) {
          return sumColumn(transactionRows, numStaticColumns + maxDiscounts * numDiscountColumns);
        }
        return "";
      }) : []).join(",")
    }`
  ].join("\n");

  var hiddenElement = document.createElement('a');  
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);  
  hiddenElement.target = '_blank';  
    
  //provide the name for the CSV file to be downloaded  
  const date = new Date();
  hiddenElement.download = `${reportName}_${date.getMonth()}_${date.getDate()}_${date.getFullYear()}.csv`;  
  hiddenElement.click();  
}
