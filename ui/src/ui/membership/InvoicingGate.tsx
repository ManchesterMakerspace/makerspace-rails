import * as React from "react";
import { listInvoiceOptions, InvoiceableResource } from "makerspace-ts-api-client";
import useReadTransaction from "ui/hooks/useReadTransaction";

/**
 * Since we cant gate all Invoicing features by a user permission, this allows disabling of all invoicing by disabling or removing
 * invoice options. If all billing permissions are set to false and no results  return from this options request, effectively
 * all invoicing components will be disabled. Useful for an emergency response.
 */
const InvoicingGate: React.FC<{ children(available: boolean): JSX.Element }> = ({ children }) => {
  const {
    data: options = []
  } = useReadTransaction(listInvoiceOptions, { types: [InvoiceableResource.Member] });

  return children(!!options.length);
};


export default InvoicingGate;
