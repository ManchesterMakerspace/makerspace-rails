import { Invoice } from "makerspace-ts-api-client";
import { timeToDate } from "../utils/timeToDate";

// export const isInvoiceSettled = (invoice: Invoice): boolean => invoice && (invoice.settled);
export const isInvoiceSettled = (invoice: Invoice): boolean => invoice && (invoice.settled || !!invoice.transactionId);

export const isInvoicePayable = (invoice: Invoice): boolean => invoice && !isInvoiceSettled(invoice) && !invoice.subscriptionId;

export const renderInvoiceDueDate = (invoice: Invoice): string => {
  const dueDate = timeToDate(invoice.dueDate);
  if (invoice.subscriptionId) {
    return `Automatic Payment on ${dueDate}`
  } else {
    if (invoice.settled) {
      return "Paid"
    } else {
      return dueDate;
    }
  }
};

export const renderInvoiceStatus = (invoice: Invoice): string => {
  if (invoice.refunded) {
    return "Refunded";
  } else if (isInvoiceSettled(invoice)) {
    return "Paid";
  } else if (invoice.pastDue) {
    return "Past Due";
  } else {
    return "Upcoming";
  }
}
