import * as React from "react";
import useReactRouter from "use-react-router";

import { Invoice } from "makerspace-ts-api-client";
import { Routing } from "app/constants";

import { useEmptyCart, useAddToCart } from "ui/checkout/cart";
import InvoicesTable from "./InvoicesTable";

const InvoicesList: React.FC = () => {
  const { history } = useReactRouter();
  const resetCart = useEmptyCart();
  const addToCart = useAddToCart();
  const goToCheckout = React.useCallback((selectedInvoice: Invoice) =>  {
    resetCart();
    addToCart(selectedInvoice);
    history.push(Routing.Checkout);
  }, [resetCart, addToCart, history]);

  return <InvoicesTable stageInvoice={goToCheckout}/>;
};

export default InvoicesList;
