import * as React from "react";
import { Invoice } from "makerspace-ts-api-client"
import KeyValueItem from "ui/common/KeyValueItem";
import { numberAsCurrency } from "../utils/numberAsCurrency";
import { renderInvoiceDueDate, renderInvoiceStatus } from "./utils";


const InvoiceDetails: React.FC<{ invoice: Invoice, summaryOnly?: boolean }> = ({ invoice, summaryOnly }) => {
  return (
    <>
      <KeyValueItem label="Member">
        <span id="view-invoice-member">{invoice.memberName}</span>
      </KeyValueItem>
      <KeyValueItem label="Description">
        <span id="view-invoice-description">{invoice.description}</span>
      </KeyValueItem>
      <KeyValueItem label="Amount">
        <span id="view-invoice-amount">{numberAsCurrency(invoice.amount)}</span>
      </KeyValueItem>
      {!summaryOnly && (
        <>
          <KeyValueItem label="Due Date">
            <span id="view-invoice-due-date">{renderInvoiceDueDate(invoice)}</span>
          </KeyValueItem>
          <KeyValueItem label="Status">
            <span id="view-invoice-status">{renderInvoiceStatus(invoice)}</span>
          </KeyValueItem>
        </>
      )}
    </>
  )
}

export default InvoiceDetails;
