import * as React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Accordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Grid from '@material-ui/core/Grid';

import { listPaymentMethods, isApiErrorResponse } from "makerspace-ts-api-client";

import useReadTransaction from "ui/hooks/useReadTransaction";
import PaymentMethodComponent from "ui/checkout/PaymentMethod";
import LoadingOverlay from "ui/common/LoadingOverlay";
import { useSearchQuery } from "hooks/useSearchQuery";
import { useFormContext } from "components/Form/FormContext";
import { RadioGroup } from "components/Form/inputs/RadioGroup";
import { usePaymentMethodsContext } from "./PaymentMethodsContext";
import { CreditCardConsumer, CreditCardForm } from "./CreditCardForm";
import { PayPalConsumer, PayPalForm } from "./PayPalForm";
import {
  paymentMethodQueryParam,
  PaymentType,
  paymentTypeFieldName,
  selectedFieldName,
} from "./constants";

interface Props {
}


const AccordionSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

export const PaymentMethods: React.FC<Props> = () => {
  const { loading } = usePaymentMethodsContext();
  const { values, setValue } = useFormContext();
  const { isRequesting, response, refresh } = useReadTransaction(listPaymentMethods, {});
  const paymentMethods = !isApiErrorResponse(response) && response?.data || [];

  const { priorPaymentMethod } = useSearchQuery({ priorPaymentMethod: paymentMethodQueryParam });
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = React.useState<string>(priorPaymentMethod);

  // Update the selection when the list of payment methods finishes loading
  React.useEffect(() => {
    if (!isRequesting) {
      if (!!paymentMethods.length) {
        const foundMethod = selectedPaymentMethodId && paymentMethods.find(pm => pm.id === selectedPaymentMethodId) || paymentMethods[0]
        setSelectedPaymentMethodId(foundMethod.id);
        setValue(paymentTypeFieldName, PaymentType.Existing);
      } else {
        values[paymentTypeFieldName] === PaymentType.Existing && setValue(paymentTypeFieldName, PaymentType.CreditCard);
      }
    }
  }, [isRequesting]);

  // Refresh payment methods and reset the selection if the URL param changes
  // This will happen when 3P controlled payment method forms (eg PayPal) successfully
  // create a new payment method outside of this workflow
  React.useEffect(() => {
    if (priorPaymentMethod && priorPaymentMethod !== selectedPaymentMethodId) {
      refresh();
      setSelectedPaymentMethodId(priorPaymentMethod);
    }
  }, [priorPaymentMethod]);

  const updateType = React.useCallback((newType) => () => {
    setValue(paymentTypeFieldName, newType);
    setSelectedPaymentMethodId("");
  }, [setValue, setSelectedPaymentMethodId]);

  return (
    <CreditCardConsumer>
      {({ loading: ccLoading }) => (
        <PayPalConsumer>
          {({ loading: paypalLoading }) => (
            <RadioGroup fieldName={paymentTypeFieldName} defaultValue={PaymentType.Existing}>
              <>
                {(loading || paypalLoading || ccLoading || isRequesting) && <LoadingOverlay id="payment-method-form" />}
                <Accordion
                  expanded={values[paymentTypeFieldName] === PaymentType.Existing}
                  onChange={(_, expanded) => expanded && setValue(paymentTypeFieldName, PaymentType.Existing)}
                >
                  <AccordionSummary
                    aria-controls="saved-payment-methods-content"
                    id="saved-payment-methods-header"
                  >
                    <FormControlLabel
                      value={PaymentType.Existing}
                      label="Saved Payment Methods"
                      control={<Radio color="primary" />}
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container>
                      <Grid item xs={12}>
                        {!!paymentMethods.length ? (
                          <RadioGroup
                            aria-label="Payment Method"
                            fieldName={selectedFieldName}
                            value={selectedPaymentMethodId}
                            onChange={setSelectedPaymentMethodId}
                          >
                            {paymentMethods.map(paymentMethod => (
                              <FormControlLabel
                                classes={{ label: "flex" }}
                                key={paymentMethod.id}
                                value={paymentMethod.id}
                                label={(
                                  <PaymentMethodComponent
                                    {...paymentMethod}
                                    key={`${paymentMethod.id}-label`}
                                    id={`select-payment-method-${paymentMethod.id}`}
                                  />
                                )}
                                labelPlacement="end"
                                control={<Radio color="secondary" />}
                              />
                            ))}
                          </RadioGroup>
                        ) : (isRequesting ? <LoadingOverlay contained={true} /> : "No payment methods on file" )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={values[paymentTypeFieldName] === PaymentType.CreditCard}
                  onClick={() => updateType(PaymentType.CreditCard)}
                >
                  <AccordionSummary
                    aria-controls="cc-content"
                    id="cc-header"
                  >
                    <FormControlLabel
                      value={PaymentType.CreditCard}
                      label="Debit or Credit Card"
                      control={<Radio color="primary" />}
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <CreditCardForm />
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  onClick={() => updateType(PaymentType.PayPal)}
                  expanded={values[paymentTypeFieldName] === PaymentType.PayPal}
                >
                  <AccordionSummary
                    aria-controls="paypal-content"
                    id="paypal-header"
                  >
                    <FormControlLabel
                      value={PaymentType.PayPal}
                      label="PayPal"
                      control={<Radio color="primary" />}
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <PayPalForm />
                  </AccordionDetails>
                </Accordion>
              </>
            </RadioGroup>
          )}
        </PayPalConsumer>
      )}
    </CreditCardConsumer>
  );
}
