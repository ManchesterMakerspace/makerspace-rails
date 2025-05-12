import * as React from "react";
import useReactRouter from "use-react-router";
import { sendRegistrationEmail } from "makerspace-ts-api-client";
import Grid from "@material-ui/core/Grid";

import Form from "ui/common/Form";
import { Routing } from "app/constants";
import useWriteTransaction from "ui/hooks/useWriteTransaction";

const SendRegistrationComponent: React.FC = () => {
  const { history, match: { params: { email } } } = useReactRouter<{ email: string }>();
  const goToMembers = React.useCallback(() => history.push(Routing.Members), []);
  const { isRequesting, error, call } = useWriteTransaction(sendRegistrationEmail);
  const [success, setSuccess] = React.useState(false);

  const submitRequest = React.useCallback(async () => {
    await call({ body: { email } });
    if (!error) {
      setSuccess(true);
    }
  }, [setSuccess, error, call]);

  return (
    <Grid container justify="center">
      <Grid item xs={12} sm={8} md={6}>
        <Form
          id="send-registration-form"
          onSubmit={success ? goToMembers : submitRequest}
          submitText={success ? 'Return to app' : 'Send email'}
          onCancel={!success && goToMembers}
          error={error}
          loading={isRequesting}
        >
          {success ?
            'Email sent successfully. You can now return to the app'
            : `Send registration email to ${email}?`
          }
        </Form>
      </Grid>
    </Grid>
  )
}

export default SendRegistrationComponent;
