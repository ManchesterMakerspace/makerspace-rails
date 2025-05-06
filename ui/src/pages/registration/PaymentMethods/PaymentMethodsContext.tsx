import * as React from "react";
import * as Braintree from "braintree-web";
import useReadTransaction from "ui/hooks/useReadTransaction";
import useWriteTransaction from "ui/hooks/useWriteTransaction";
import { getNewPaymentMethod, createPaymentMethod as createPaymentMethodApi } from "makerspace-ts-api-client";
import { PayPalProvider } from "./PayPalForm";
import { CreditCardProvider } from "./CreditCardForm";
import { useSetSearchQuery } from "hooks/useSearchQuery";
import { paymentMethodQueryParam } from "./constants";

interface PaymentMethodsContext {
  braintreeClient: Braintree.Client;
  createPaymentMethod(nonce: string, makeDefault?: boolean): Promise<any>;
  loading: boolean;
  error: Braintree.BraintreeError | string;
}

const PaymentMethodsContext = React.createContext<PaymentMethodsContext>({
  createPaymentMethod: (_: string) => Promise.resolve({}),
  braintreeClient: undefined,
  loading: false,
  error: undefined,
});

interface Props {}

export const PaymentMethodsProvider: React.FC<Props> = ({ children }) => {
  const setSearch = useSetSearchQuery();

  const {
    isRequesting: tokenLoading,
    error: tokenError,
    data
  } = useReadTransaction(getNewPaymentMethod, {});

  const {
    call: createPaymentMethod,
    error: createPaymentMethodError,
    isRequesting: creatingPaymentMethod
  } = useWriteTransaction(createPaymentMethodApi, ({ response }) => {
    // On success, store nonce in URL for later
    setSearch({ [paymentMethodQueryParam]: response.data.id });
  });

  const [clientError, setClientError] = React.useState<Braintree.BraintreeError>();
  const [client, setClient] = React.useState<Braintree.Client>();
  const [clientLoading, setClientLoading] = React.useState(false);

  // Initialize Braintree once the token is loaded or changes
  React.useEffect(() => {
    if (data?.clientToken) {
      setClientLoading(true);

      Braintree.client.create({ authorization: data?.clientToken },
        (err, clientInstance) => {
          if (err) setClientError(err);
          setClient(clientInstance);
          setClientLoading(false);
        });
    }
  }, [data]);

  const context: PaymentMethodsContext = React.useMemo(() => {
    return {
      createPaymentMethod: (nonce: string, makeDefault?: boolean) => createPaymentMethod({ body: { paymentMethodNonce: nonce, makeDefault } }),
      loading: tokenLoading || clientLoading || creatingPaymentMethod,
      error: tokenError || clientError || createPaymentMethodError,
      braintreeClient: client,
    };
  }, [
    client,
    createPaymentMethod,
    tokenLoading,
    clientLoading,
    creatingPaymentMethod,
    tokenError,
    clientError,
    createPaymentMethodError,
  ]);

  return (
    <PaymentMethodsContext.Provider value={context}>
      <CreditCardProvider>
        <PayPalProvider>
          {children}
        </PayPalProvider>
      </CreditCardProvider>
    </PaymentMethodsContext.Provider>
  );
};

export function usePaymentMethodsContext() {
  return React.useContext(PaymentMethodsContext);
}
