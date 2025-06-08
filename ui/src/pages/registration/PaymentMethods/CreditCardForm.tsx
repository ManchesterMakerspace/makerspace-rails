import * as React from "react";
import * as Braintree from "braintree-web";
import { HostedFieldsHostedFieldsCard } from "braintree-web/modules/hosted-fields";
import Grid from "@material-ui/core/Grid";
import { usePaymentMethodsContext } from "./PaymentMethodsContext";
import { useFormContext, FormContextProvider } from "components/Form/FormContext";
import { EmittedBy, CreditCardFields, hostedFieldStyles } from "./constants";
import ErrorMessage from "ui/common/ErrorMessage";
import { CollectionOf } from "app/interfaces";
import { message } from "makerspace-ts-api-client";
import useWriteTransaction from "ui/hooks/useWriteTransaction";

interface CreditCardContext {
  initialize(): void;
  submit(): Promise<void>;
  validate(): CollectionOf<any>;
  loading: boolean;
  error: Braintree.BraintreeError | string;
  cardType: HostedFieldsHostedFieldsCard
}

const CreditCardContext = React.createContext({
  initialize: () => {},
  submit: () => Promise.resolve(),
  validate: () => ({}),
  loading: false,
  error: undefined,
  cardType: undefined,
});

export const CreditCardConsumer = CreditCardContext.Consumer;

interface Props {}

export const CreditCardProvider: React.FC<Props> = ({ children }) => {
  const { braintreeClient, createPaymentMethod } = usePaymentMethodsContext();
  const { setError } = useFormContext();

  const [instanceError, setInstanceError] = React.useState<Braintree.BraintreeError | string>();
  const [instance, setInstance] = React.useState<Braintree.HostedFields>();
  const [instanceLoading, setInstanceLoading] = React.useState(true);
  const [cardType, setCardType] = React.useState<HostedFieldsHostedFieldsCard>();

  const { call: reportError } = useWriteTransaction(message);

  const initFields = React.useCallback(() => {
    setInstanceLoading(true);
    Braintree.hostedFields.create({
      client: braintreeClient,
      styles: hostedFieldStyles,
      fields: Object.entries(CreditCardFields).reduce((fields, [key, field]) => {
          fields[key] = {
            selector: `#${field.name}`,
            placeholder: field.placeholder
          }
        return fields;
      }, {} as Braintree.HostedFieldFieldOptions),
    }, (err, hostedFieldsInstance: Braintree.HostedFields) => {
      setInstanceLoading(false);

      if (err) {
        setInstanceError(err);
        reportError({ body: { message: err.message } });
        return;
      };
      setInstance(hostedFieldsInstance);

      hostedFieldsInstance.on("validityChange", (event) => {
        const { fields, emittedBy } = event;
        const { isPotentiallyValid } = fields[emittedBy];
        setInstanceError(undefined);

        if (!isPotentiallyValid) {
          setError(emittedBy, "Invalid")
        }
      });

      hostedFieldsInstance.on("cardTypeChange", (event) => {
        const { cards } = event;
        if (cards.length === 1) {
          setCardType(cards[0]);
        }
      });

      hostedFieldsInstance.on("empty", (event) => {
        const { emittedBy } = event;
        if (emittedBy === EmittedBy.Number) {
          setCardType(undefined);
        }
      });

      hostedFieldsInstance.on("blur", (event) => {
        const { fields, emittedBy } = event;
        const { isValid, isPotentiallyValid } = fields[emittedBy];
        if (!isValid || !isPotentiallyValid) {
          setError(emittedBy, "Invalid")
        }
      });

    });
  }, [braintreeClient, setInstance, setInstanceError, setInstanceLoading, setCardType, setError]);

  const submit = React.useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      setInstanceError(undefined);
      setInstanceLoading(true);
      instance && instance.tokenize({ vault: true }, (err: Braintree.BraintreeError, payload:{ [key: string]: string }) => {
        setInstanceLoading(false);
        if (err) {
          setInstanceError(err);
          reject(err);
          return;
        }

        return createPaymentMethod(payload.nonce, true).then(resolve).catch(reject);
      });
    });

  }, [instance, setInstanceLoading, setInstanceError]);

  React.useEffect(() => {
    instance?.setPlaceholder(
      EmittedBy.Cvv, cardType?.code.size === 4 ? "1234" : "123"
    )
  }, [cardType]);

  const validate = React.useCallback(() => {
    if (!instance) {
      setInstanceError("Please try again");
      return { error: true };
    }

    const formState = instance.getState();
    const isValid = Object.keys(CreditCardFields).every(fieldName => formState.fields[fieldName]?.isValid);

    if (!isValid) {
      setInstanceError("Invalid card information. Review your selections and try again");
      return { error: true };
    }

  }, [instance, setInstanceError]);

  const context: CreditCardContext = React.useMemo(() => {
    return {
      cardType,
      submit,
      validate,
      initialize: braintreeClient && initFields,
      loading: instanceLoading,
      error: instanceError,
    };
  }, [braintreeClient, cardType, instanceLoading, instanceError, initFields, submit]);

  return (
    <CreditCardContext.Provider value={context}>
      <FormContextProvider>
        {children}
      </FormContextProvider>
    </CreditCardContext.Provider>
  );
};

export function useCreditCardContext(): CreditCardContext {
  return React.useContext(CreditCardContext);
}

export const CreditCardForm: React.FC = ({ }) => {
  const { error: ccError, cardType, initialize, submit } = useCreditCardContext();
  const { error: createPaymentMethodError } = usePaymentMethodsContext();
  const error = ccError || createPaymentMethodError;

  React.useEffect(() => {
    initialize?.();
  }, [initialize]);

  return (
    <Grid container spacing={8} justify="center">
      <Grid item xs={12}>
        <form id="cc-form" className={`scale-down ${cardType?.type}`}>
          <div className="cardinfo-card-number">
            <label
              className="cardinfo-label"
              htmlFor={CreditCardFields[EmittedBy.Number].name}
            >
              {CreditCardFields[EmittedBy.Number].label}
            </label>
            <div
              className='input-wrapper'
              id={CreditCardFields[EmittedBy.Number].name}
            ></div>
            <div className={cardType?.type} id="card-image"></div>
          </div>

          <div className="cardinfo-wrapper">
            <div className="cardinfo-exp-date">
              <label
                className="cardinfo-label"
                htmlFor={CreditCardFields[EmittedBy.ExpirationDate].name}
              >
                {CreditCardFields[EmittedBy.ExpirationDate].label}
              </label>
              <div
                className='input-wrapper'
                id={CreditCardFields[EmittedBy.ExpirationDate].name}
              ></div>
            </div>

            <div className="cardinfo-cvv">
              <label
                className="cardinfo-label"
                htmlFor={CreditCardFields[EmittedBy.Cvv].name}
              >
                {CreditCardFields[EmittedBy.Cvv].label}
              </label>
              <div className='input-wrapper' id={CreditCardFields[EmittedBy.Cvv].name}></div>
            </div>
          </div>

          <div className="cardinfo-name">
            <label
              className="cardinfo-label"
              htmlFor={CreditCardFields[EmittedBy.CardholderName].name}
            >
              {CreditCardFields[EmittedBy.CardholderName].label}
            </label>
            <div
              className='input-wrapper'
              id={CreditCardFields[EmittedBy.CardholderName].name}
            ></div>
          </div>

          <div className="cardinfo-postalcode">
            <label
              className="cardinfo-label"
              htmlFor={CreditCardFields[EmittedBy.PostalCode].name}
            >
              {CreditCardFields[EmittedBy.PostalCode].label}
            </label>
            <div
              className='input-wrapper'
              id={CreditCardFields[EmittedBy.PostalCode].name}
            ></div>
          </div>
        </form>
        {error && <ErrorMessage error={typeof error === "string" ? error : error.message} />}
      </Grid>
    </Grid>
  )
}
