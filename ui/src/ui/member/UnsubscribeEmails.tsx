import * as React from "react";
import useReactRouter from "use-react-router";
import { updateMember } from "makerspace-ts-api-client";
import Grid from "@material-ui/core/Grid";

import Form from "ui/common/Form";
import useWriteTransaction from "ui/hooks/useWriteTransaction";
import { buildProfileRouting } from "./utils";

const UnsubscribeEmails: React.FC = () => {
  const { history, match: { params: { memberId } } } = useReactRouter<{ memberId: string }>();
  const goToProfile = React.useCallback(() => history.push(buildProfileRouting(memberId)), [memberId]);
  const { isRequesting, error, call } = useWriteTransaction(updateMember);
  const [success, setSuccess] = React.useState(false);

  const submitRequest = React.useCallback(async () => {
    await call({ id: memberId, body: { silenceEmails: true } });
    if (!error) {
      setSuccess(true);
    }
  }, [setSuccess, error, call]);

  return (
    <Grid container justify="center">
      <Grid item xs={12} sm={8} md={6}>
        <Form
          id="unregister"
          onSubmit={success ? goToProfile : submitRequest}
          submitText={success ? 'Return to app' : 'Unsubscribe'}
          onCancel={!success && goToProfile}
          error={error}
          loading={isRequesting}
        >
          {success ?
            'Unsubscribed.'
            : `Are you sure you want to unsubscribe from future emails?`
          }
        </Form>
      </Grid>
    </Grid>
  )
}

export default UnsubscribeEmails;
