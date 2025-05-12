import * as React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { RouteComponentProps } from "react-router-dom";

import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import Paper from "@material-ui/core/Paper";
import RemoveRedEye from "@material-ui/icons/RemoveRedEye";
import Typography from "@material-ui/core/Typography";

import { Routing } from "app/constants";
import Form, { FormFields } from "ui/common/Form";
import ErrorMessage from "ui/common/ErrorMessage";
import { ScopedThunkDispatch } from "ui/reducer";
import { loginUserAction } from "ui/auth/actions";
import { resetPassword, isApiErrorResponse, message } from "makerspace-ts-api-client";

interface DispatchProps {
  attemptLogin: () => void;
  goToRoot: () => void;
}
interface StateProps {}
interface OwnProps extends RouteComponentProps<{ token: string }> {}
interface Props extends OwnProps, StateProps, DispatchProps {}

interface State {
  passwordMask: boolean;
  passwordRequesting: boolean;
  passwordError: string;
}

const passwordId = "password-reset";
const passwordFields: FormFields = {
  password: {
    label: "Enter New Password",
    name: `${passwordId}-input`,
    placeholder: "Enter New Password",
    error: "Invalid password",
    validate: (val: string) => !!val
  }
}
interface PasswordForm {
  password: string;
}

class PasswordReset extends React.Component<Props, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  constructor(props: Props) {
    super(props);
    this.state = {
      passwordMask: true,
      passwordError: undefined,
      passwordRequesting: false,
    };
  }

  public componentDidMount() {
    const { goToRoot } = this.props;
    const { token: passwordToken } = this.props.match.params;
    if (!passwordToken) {
      goToRoot();
    }
  }

  private togglePasswordMask = () => {
    this.setState((state) => ({ passwordMask: !state.passwordMask }));
  }

  private submit = async (form: Form) => {
    const { password } = await this.formRef.simpleValidate<PasswordForm>(passwordFields);
    const { token: passwordToken } = this.props.match.params;

    if (!form.isValid()) return;

    this.setState({ passwordRequesting: true });
    try {
      // Successfully changing password counts as auth action for Devise
      const passwordReset = await resetPassword({ body: { member: { resetPasswordToken: passwordToken, password } } });
      if (isApiErrorResponse(passwordReset)) {
        const error = passwordReset.error.message;
        const deviseErrors = (passwordReset.error as any).errors;
        const passwordError = error || (deviseErrors && Object.entries(deviseErrors).map(([field, error]) => `${field} ${error}`).join(". "))

        this.setState({ passwordRequesting: false, passwordError });
      } else {
        // TODO: Toast Message
        await this.props.attemptLogin();
        this.setState({ passwordRequesting: false });
      }
    } catch (e) {
      message({ body: { message: JSON.stringify(e) }})
      console.error("ERR", e);
    }

  }

  public render(): JSX.Element {
    const { passwordMask, passwordError, passwordRequesting } = this.state;
    return (
      <Grid container spacing={3} justify="center">
        <Grid item xs={12} md={6}>
          <Paper style={{ minWidth: 275, padding: "1rem" }}>
              <Form
                ref={this.setFormRef}
                id={passwordId}
                title="Reset Password"
                onSubmit={this.submit}
                loading={passwordRequesting}
                submitText="Save"
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body1">Please enter your new password.</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      autoComplete="new-password"
                      label={passwordFields.password.label}
                      name={passwordFields.password.name}
                      id={passwordFields.password.name}
                      placeholder={passwordFields.password.placeholder}
                      type={passwordMask ? "password" : "text"}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <RemoveRedEye style={{ cursor: "pointer" }} onClick={this.togglePasswordMask} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
                {!passwordRequesting && passwordError && (
                  <ErrorMessage id={"password-reset-error"} error={passwordError} />
                )}
              </Form>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    attemptLogin: async () => dispatch(await loginUserAction()),
    goToRoot: () => dispatch(push(Routing.Root))
  };
}

export default connect(null, mapDispatchToProps)(PasswordReset);
