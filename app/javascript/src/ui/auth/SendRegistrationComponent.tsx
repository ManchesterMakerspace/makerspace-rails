import * as React from "react";
import Form from "ui/common/Form";
import { sendRegistrationEmail } from "api/auth/transactions";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";
import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { push } from "connected-react-router";
import { Routing } from "app/constants";
import { Grid } from "@material-ui/core";

interface DispatchProps {
  goToMembers: () => void;
}
interface OwnProps extends RouteComponentProps<{ email: string }> {}
interface Props extends DispatchProps, OwnProps {}
interface State {
  error: string;
  success: boolean;
  loading: boolean;
}

class SendRegistrationComponent extends React.Component<Props, State> {

  public constructor(props: Props) {
    super(props);
    this.state = {
      error: "",
      loading: false,
      success: false
    };
  }

  private submitRequest = async () => {
    try {
      this.setState({ loading: true });
      await sendRegistrationEmail(this.props.match.params.email);
      this.setState({ success: true, loading: false });
    } catch (e) {
      const { errorMessage } = e;
      this.setState({ error: errorMessage, loading: false });
    }
  }

  public render() {
    const { success, error, loading } = this.state;
    const { goToMembers, match: { params: { email }} } = this.props;

    return (
      <Grid container justify="center">
        <Grid item xs={12} sm={8} md={6}>
          <Form
            id="send-registration-form"
            onSubmit={success ? goToMembers : this.submitRequest}
            submitText={success ? 'Return to app' : 'Send email'}
            onCancel={!success && goToMembers}
            error={error}
            loading={loading}
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
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    goToMembers: () => dispatch(push(Routing.Members)),
  };
}

export default withRouter(connect(null, mapDispatchToProps)(SendRegistrationComponent))