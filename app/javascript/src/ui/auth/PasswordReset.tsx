import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, Redirect } from "react-router";

import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import RemoveRedEye from "@material-ui/icons/RemoveRedEye";
import Typography from "@material-ui/core/Typography";

import { Routing } from "app/constants";
import { putPassword } from "api/auth/transactions";
import Form, { FormFields } from "ui/common/Form";
import ErrorMessage from "ui/common/ErrorMessage";
import { ScopedThunkDispatch } from "ui/reducer";
import { activeSessionLogin } from "ui/auth/actions";

interface DispatchProps {
  attemptLogin: () => void;
}
interface OwnProps extends RouteComponentProps<any> {}
interface Props extends OwnProps, DispatchProps {}

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

  private togglePasswordMask = () => {
    this.setState((state) => ({ passwordMask: !state.passwordMask }));
  }

  private submit = async (form: Form) => {
    const { password } = await this.formRef.simpleValidate<PasswordForm>(passwordFields);
    const { token } = this.props.match.params;

    if (!form.isValid()) return;

    this.setState({ passwordRequesting: true });
    try {
      // Successfully changing password counts as auth action for Devise
      await putPassword(token, password);
      // TODO: Toast Message
      await this.props.attemptLogin();
      // TODO: Toast Message
      this.setState({ passwordRequesting: false });
    } catch (e) {
      const { errorMessage } = e;
      this.setState({ passwordRequesting: false, passwordError: errorMessage });
    }
  }

  public render(): JSX.Element {
    const { passwordMask, passwordError, passwordRequesting } = this.state;
    const { token } = this.props.match.params;

    if (!token) {
      return (<Redirect to={Routing.Root}/>)
    }
    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={12} md={6}>
          <Card style={{minWidth: 275}}>
            <CardContent>
              <Form
                ref={this.setFormRef}
                id={passwordId}
                title="Reset Password"
                onSubmit={this.submit}
                submitText="Save"
              >
                <Grid container spacing={16}>
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
                      type={passwordMask ? 'password' : 'text'}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <RemoveRedEye style={{ cursor: 'pointer' }} onClick={this.togglePasswordMask} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                {!passwordRequesting && passwordError && <ErrorMessage id={"password-reset-error"} error={passwordError} />}
              </Form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    attemptLogin: async () => dispatch(await activeSessionLogin())
  }
}

export default (connect(null, mapDispatchToProps)(PasswordReset));
