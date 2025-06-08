import * as React from "react";
import useReactRouter from "use-react-router";
import { useDispatch } from "react-redux";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import TableContainer from "ui/common/table/TableContainer";
import Table from "ui/common/table/Table";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import ErrorMessage from "ui/common/ErrorMessage";
import LoadingOverlay from "ui/common/LoadingOverlay";
import FormModal from "ui/common/FormModal";
import { sessionLoginUserAction } from "ui/auth/actions";
import { CartItem, useCartState, isInvoiceSelection } from "./cart";
import useModal from "../hooks/useModal";
import { Routing } from "app/constants";
import useWriteTransaction, { SuccessTransactionState } from "../hooks/useWriteTransaction";
import { createTransaction, Transaction } from "makerspace-ts-api-client";
import SubscriptionAuthorizationModal from "ui/checkout/SubscriptionAuthorizationModal";
import { AnyPaymentMethod } from "app/entities/paymentMethod";
import PaymentMethodComponent from "./PaymentMethod";

const getCartId = (item: CartItem) => item.id;

// TODO: this should use discount
// Only display the discount amount if using invoice option
const renderAmount = (item: CartItem) => {
  let amt = Number(item.amount);
  if (item.discountId && !isInvoiceSelection(item)) {
    amt = amt * .9;
  }
  return numberAsCurrency(amt);
}

interface Props {
  paymentMethod: AnyPaymentMethod;
}
const CartList: React.FC<Props> = ({ paymentMethod }) => {
  const { item } = useCartState();
  const { history } = useReactRouter();
  const dispatch = useDispatch();

  const {
    isOpen: subscriptionAuthOpen,
    openModal: openSubscriptionAuth,
    closeModal: closeSubscriptionAuth
  } = useModal();

  const onSuccess = React.useCallback(({ response: { data: transaction } }: SuccessTransactionState<Parameters<typeof createTransaction>[0], Transaction>) => {
    const invoiceId = transaction && transaction.invoice.id;
    dispatch(sessionLoginUserAction());

    if (invoiceId) {
      history.push(`${Routing.Receipt.replace(Routing.PathPlaceholder.InvoiceId, invoiceId)}`)
    }
  }, [history, dispatch]);
  const { call, isRequesting, error, reset } = useWriteTransaction(createTransaction, onSuccess);
  const { isOpen: errorIsOpen, openModal, closeModal } = useModal();

  const closeErrModal = React.useCallback(() => {
    reset();
    closeModal();
  }, [reset, closeModal]);

  // Open error modal on error
  React.useEffect(() => {
    !isRequesting && error && openModal();
  }, [isRequesting, error]);

  const getFields = React.useCallback((withError: boolean) => [
    {
      id: "name",
      label: "Name",
      cell: (row: CartItem) => row.name,
    },
    ...withError ? []: [{
      id: "description",
      label: "Description",
      cell: (row: CartItem) => {
        return (
          <>
            <div>{row.description}</div>
          </>
        )
      },
    }],
    {
      id: "amount",
      label: "Amount",
      cell: (row: CartItem) => renderAmount(row),
    },
    ...withError ? [{
      id: "error",
      label: "Error",
      cell: (row: CartItem) => {
        return <ErrorMessage error={error}/>;
      },
    }]: []
  ], [error]);

  const submitPayment = React.useCallback(() => {
    if (!paymentMethod) {
      return;
    }
    call({
      body: {
        ...(isInvoiceSelection(item)
          ? {
              invoiceId: item.id
            }
          : {
              invoiceOptionId: item.id,
              ...(item.discountId && { discountId: item.discountId })
            }),
        paymentMethodId: paymentMethod.id
      }
    });
  }, [call, item, paymentMethod]);

  const onSubscriptionAuthConfirm = React.useCallback(() => {
    submitPayment();
    closeSubscriptionAuth();
  }, [closeSubscriptionAuth, submitPayment]);

  if (!item) {
    return null;
  }

  return (
    <>
      <Card style={{ height: "100%" }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TableContainer
                id="checkout-invoices-table"
                title="Review Items Before Purchase"
                data={item ? [item] : []}
                columns={getFields(false)}
                rowId={getCartId}
              />
            </Grid>
            <Grid item xs={12} style={{ textAlign: "right" }}>
              <Typography id="total" variant="h6" color="inherit">
                Total {renderAmount(item)}
              </Typography>
            </Grid>
            <Grid item xs={12} style={{ marginBottom: "1rem" }}>
              <PaymentMethodComponent {...paymentMethod} />
            </Grid>
            <Grid item xs={12} style={{ textAlign: "left" }}>
              <Button
                id="submit-payment-button"
                variant="contained"
                color="primary"
                disabled={!paymentMethod || isRequesting}
                onClick={item.planId ? openSubscriptionAuth : submitPayment}
              >
                Submit Payment
              </Button>
            </Grid>
          </Grid>
          {isRequesting && <LoadingOverlay id="checkout-submitting-overlay" />}
        </CardContent>
      </Card>
      {errorIsOpen && (
        <FormModal
          id="payment-error-modal"
          title="Error processing transactions"
          isOpen={true}
          onSubmit={closeErrModal}
          submitText="Okay"
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1">
                There was an error processing one or more transactions. Please review these errors and try again
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Table
                id="payment-invoices-table"
                data={item ? [item] : []}
                columns={getFields(true)}
                rowId={getCartId}
              />
            </Grid>
          </Grid>
        </FormModal>
      )}

      {subscriptionAuthOpen && <SubscriptionAuthorizationModal onConfirm={onSubscriptionAuthConfirm} item={item} />}
    </>
  );
};

export default CartList;
