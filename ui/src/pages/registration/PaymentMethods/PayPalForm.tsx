import * as React from "react";
import * as Braintree from "braintree-web";
import * as PayPal from "paypal-checkout";
import Grid from "@material-ui/core/Grid";
import { usePaymentMethodsContext } from "./PaymentMethodsContext";
import { FormContextProvider, useFormContext } from "components/Form/FormContext";
import ErrorMessage from "ui/common/ErrorMessage";
import { FormField } from "components/Form/FormField";
import { paypalValidation } from "./constants";
import { message } from "makerspace-ts-api-client";
import useWriteTransaction from "ui/hooks/useWriteTransaction";

interface PayPalContext {
  initialize(): void;
  loading: boolean;
  error: Braintree.BraintreeError | string;
}

const PayPalContext = React.createContext({
  initialize: () => {},
  loading: false,
  error: undefined,
});

export const PayPalConsumer = PayPalContext.Consumer;

interface Props {}

export const PayPalProvider: React.FC<Props> = ({ children }) => {
  const { braintreeClient, createPaymentMethod } = usePaymentMethodsContext();
  const { setError } = useFormContext();

  const [instanceError, setInstanceError] = React.useState<Braintree.BraintreeError>();
  const [instance, setInstance] = React.useState<Braintree.HostedFields>();
  const [instanceLoading, setInstanceLoading] = React.useState(true);

  const { call: reportError } = useWriteTransaction(message);

  const initFields = React.useCallback(() => {
    setInstanceLoading(true);
    Braintree.paypalCheckout.create({
      client: braintreeClient
    }, (paypalCheckoutErr, paypalCheckoutInstance) => {
      setInstanceLoading(false);
      if (paypalCheckoutErr) {
        setInstanceError(paypalCheckoutErr);
        return;
      }
      setInstance(paypalCheckoutInstance);
      PayPal.Button.render({
        env: process.env.NODE_ENV === "production" ? "production" : "sandbox",
        payment: () => {
          return paypalCheckoutInstance.createPayment({
            flow: 'vault',
          });
        },

        onAuthorize: (data: any, actions: any) => {
          setError(paypalValidation, undefined);
          setInstanceError(undefined);
          setInstanceLoading(true);
          paypalCheckoutInstance.tokenizePayment(data, (err: any, payload: any) => {
            setInstanceLoading(false);
            if (err) {
              setInstanceError(err);
              reportError({ body: { message: err } });
              return;
            }

            createPaymentMethod(payload.nonce, true);
          });
        },

        onCancel: (data: any) => {
          console.log('checkout.js payment canceled');
        },

        onError: (err: any) => {
          if (err) {
            setInstanceError(err);
            reportError(err);
          }
        }
      }, '#paypal-button');
    });
  }, [braintreeClient, setInstance, setInstanceError, setInstanceLoading, reportError]);

  const context: PayPalContext = React.useMemo(() => {
    return {
      initialize: braintreeClient && initFields,
      loading: instanceLoading,
      error: instanceError,
    };
  }, [braintreeClient, instanceLoading, instanceError, initFields]);

  return (
    <PayPalContext.Provider value={context}>
      <FormContextProvider>
        {children}
      </FormContextProvider>
    </PayPalContext.Provider>
  );
};

export function usePayPalContext(): PayPalContext {
  return React.useContext(PayPalContext);
}

export const PayPalForm: React.FC = ({ }) => {
  const { error: payPalError, initialize } = usePayPalContext();
  const { error: createPaymentMethodError } = usePaymentMethodsContext();
  const error = payPalError || createPaymentMethodError;

  React.useEffect(() => {
    initialize?.();
  }, [initialize]);

  return (
    <Grid container spacing={8} justify="center">
      <Grid item xs={12}>
        <button id="paypal-button" style={{ background: "none", border: "none" }} />
        <FormField fieldName={paypalValidation} />
        {error && <ErrorMessage error={typeof error === "string" ? error : error.message} />}
      </Grid>
    </Grid>
  )
}
