import * as React from "react";
import useReactRouter from "use-react-router";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import FormModal from "ui/common/FormModal";
import { useAuthState } from "ui/reducer/hooks";
import { CartItem } from "ui/checkout/cart";
import { buildProfileRouting } from "ui/member/utils";
import Form from "ui/common/Form";

const checkboxField = {
  id: "authorization-agreement-checkbox",
  name: "authorization-agreement-checkbox",
  error: "You must accept to continue",
  label: "I agree",
  validate: (val: boolean) => !!val
};
const SubscriptionAuthorizationModal: React.FC<{ onConfirm(): void, item: CartItem }> = ({ onConfirm, item }) => {
  const { currentUser } = useAuthState();
  const { history } = useReactRouter();

  const onSubmit = React.useCallback(async (form: Form) => {
    await form.simpleValidate({ [checkboxField.id]: checkboxField });
    if (!form.isValid()) {
      return;
    }

    onConfirm();
  }, [])

  const redirect = React.useCallback(() => {
    history.push(buildProfileRouting(currentUser.id));
  }, [history, currentUser]);

  return (
    <FormModal
      id="authorization-agreement"
      title="Recurring Payment Authorization"
      isOpen={true}
      onSubmit={onSubmit}
      closeHandler={redirect}
      cancelText="Cancel Payment"
      submitText="Confirm"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="body1">
            <strong>How recurring payments work:</strong>
          </Typography>
          <div>
            <Typography variant="body1">
              You authorize regularly scheduled charges to your selected payment method. You will be charged the
              subscription amount each billing period. A receipt will be emailed to you and each charge will appear on
              your statement. You agree that no prior notification will be provided unless the date or amount changes,
              in which case you will receive notice from us at least 10 days prior to the payment being collected.
            </Typography>
          </div>
          <br />
          <br />

          <Typography variant="body1" style={{ padding: "1rem", border: "1px solid black", borderRadius: "3px" }}>
            I, {currentUser.firstname} {currentUser.lastname}, authorize Manchester Makerspace to charge ${item.amount}{" "}
            to the payment method I have selected every {item.quantity} month(s). I understand that this authorization
            will remain in effect until I notify Manchester Makerspace of cancellation in writing or electronically
            through <a target="_blank" href={`${buildProfileRouting(currentUser.id)}/settings`}>Subscription Settings</a>.
          </Typography>

          <FormControlLabel
            control={<Checkbox id={checkboxField.id} name={checkboxField.name} color="primary" />}
            label={checkboxField.label}
          />
        </Grid>
      </Grid>
    </FormModal>
  );
}

export default SubscriptionAuthorizationModal;
