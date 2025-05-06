import * as React from "react";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from '@material-ui/core/Grid';
import Hidden from "@material-ui/core/Hidden";

import { FormContextConsumer, FormContextProvider } from "components/Form/FormContext";
import { useSetSearchQuery } from "hooks/useSearchQuery";
import { CreditCardConsumer } from "../PaymentMethods/CreditCardForm";
import { PaymentMethods, handleSubmit, selectedFieldName, validatePaymentMethods } from "../PaymentMethods";
import { CartPreview } from "./CartPreview";

export const PaymentStep: React.FC = ({ children }) => {
  const setSearch = useSetSearchQuery();

  return (
    <CreditCardConsumer>
      {({ submit: submitCC, validate: validateCC }) => (
        <FormContextProvider 
          validator={validatePaymentMethods(validateCC)}
          onSubmit={handleSubmit(setSearch, submitCC)}
        >
          <Grid container spacing={2} justify="center">
            <Grid item xs={11} md={8}>
              <Grid container spacing={2} justify="center">
                <Grid item xs={12} >
                  <Box>
                    <FormContextConsumer>
                      {({ values }) => (
                        <Typography variant="body1">
                          {values[selectedFieldName] ? "Select or add" : "Add"} a payment method for membership. 
                          This payment method will be used for recurring membership payments unless changed through Account Settings.
                        </Typography>
                      )}
                    </FormContextConsumer>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <PaymentMethods />
                </Grid>

                <Hidden mdUp>
                  {children}
                </Hidden>

                <Grid item xs={12}>
                  <div>
                    <Typography variant="body1">
                      <strong>How recurring payments work:</strong>
                  </Typography>
                  </div>
                  <div>
                    <Typography variant="body1">
                      You authorize regularly scheduled charges to your selected payment method. You will be charged the
                      subscription amount each billing period. A receipt will be emailed to you and each charge will appear on
                      your statement. No prior notification will be provided unless the date or amount changes,
                      in which case you will receive notice from us at least 10 days prior to the payment being collected.
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </Grid>
            <Hidden smDown>
              <Divider orientation="vertical" flexItem />
              <Grid item md={3}>
                <CartPreview readOnly={true} />
                {children}
              </Grid>
            </Hidden>
          </Grid>
        </FormContextProvider>
      )}
    </CreditCardConsumer>
  );
};
