import * as React from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import { CreditCard, PayPalAccount } from "makerspace-ts-api-client";

export interface Props extends Partial<CreditCard>, Partial<PayPalAccount> {}

const PaymentMethodComponent: React.FC<Props> = ({ cardType, last4, debit, imageUrl, email, id }) => {
  const image = imageUrl;
  const description = cardType ? `${cardType} ending in ${last4}` : `PayPal account ${email}`;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} style={{ border: "1px solid black", borderColor: "#9E3321", borderRadius: "4px", textAlign: "center" }}>
        <img style={{float: "left", marginRight: "2em"}} src={image} alt={cardType}/>
        <Typography style={{ lineHeight: "2.5em" }} variant="subtitle1" id={id}>{description}</Typography>
      </Grid>
    </Grid>
  );
}

export default PaymentMethodComponent;