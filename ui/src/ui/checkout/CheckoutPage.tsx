import * as React from "react";
import useReactRouter from "use-react-router";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import Button from "@material-ui/core/Button";
import StepLabel from "@material-ui/core/StepLabel";

import PaymentMethodsContainer from "ui/checkout/PaymentMethodsContainer";
import CartList from "./CartList";
import ErrorMessage from "ui/common/ErrorMessage";
import { buildProfileRouting } from "../member/utils";
import { useAuthState } from "../reducer/hooks";
import { useCartState, useEmptyCart } from "ui/checkout/cart";
import { AnyPaymentMethod } from "app/entities/paymentMethod";

const steps = [
  "Select a payment method",
  "Review and confirm purchase"
]

const CheckoutPage: React.FC = () => {
  const { item } = useCartState();
  const emptyCart = useEmptyCart()
  const { history } = useReactRouter();
  const { currentUser: { id: currentUserId } } = useAuthState();

  // Redirect to profile if theres nothing in the cart
  React.useEffect(() => {
    !item && history.push(buildProfileRouting(currentUserId))
    return emptyCart;
  }, []);

  const [paymentMethod, setPaymentMethod] = React.useState<AnyPaymentMethod>();
  const [activeStep, setActiveStep] = React.useState(0);
  const [paymentMethodError, setPaymentMethodError] = React.useState<string>();

  const onSelect = React.useCallback((paymentMethod: AnyPaymentMethod) => {
    setPaymentMethod(paymentMethod);
    setPaymentMethodError(undefined);
  }, []);

  const onNext = React.useCallback(() => {
    if (!paymentMethod) {
      setPaymentMethodError("Please select a payment method");
      return;
    }
    setActiveStep(1);
  }, [paymentMethod]);

  const onBack = React.useCallback(() => {
    setActiveStep(0);
  }, []);

  return (
    <Grid container justify="center" spacing={2}>
      <Grid item sm={10} xs={12}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} onClick={() => setActiveStep(index)}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Grid>
      <Grid item sm={10} xs={12}>
        {activeStep === 0 && (
          <Card>
            <CardContent>
              <PaymentMethodsContainer
                paymentMethodToken={paymentMethod && paymentMethod.id}
                onPaymentMethodChange={onSelect}
              />
              <p>
                *The payment method used when creating a subscription will be the default payment method used for
                subscription payments unless changed through Settings.
              </p>
              {paymentMethodError && <ErrorMessage error={paymentMethodError} />}
            </CardContent>
          </Card>
        )}

        {activeStep === 1 && <CartList paymentMethod={paymentMethod} />}
      </Grid>

      <Grid item sm={10} xs={12}>
        {activeStep === 1 && (
          <Button variant="contained" onClick={onBack} id="checkout-page-back">
            Back
          </Button>
        )}
        {activeStep === 0 && (
          <Button variant="contained" color="primary" onClick={onNext} id="checkout-page-next">
            Next
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

export default CheckoutPage;