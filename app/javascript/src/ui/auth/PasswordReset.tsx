import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, Redirect } from "react-router";

import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import RemoveRedEye from "@material-ui/icons/RemoveRedEye";

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

const PasswordFields: FormFields = {
  password: {
    label: "Enter New Password",
    name: `reset-password-input`,
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
    const { password } = await this.formRef.simpleValidate<PasswordForm>(PasswordFields);
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
                id="password-reset"
                title="Reset Password"
                onSubmit={this.submit}
                submitText="Save"
              >
                <TextField
                  fullWidth
                  required
                  autoComplete="new-password"
                  label={PasswordFields.password.label}
                  name={PasswordFields.password.name}
                  id={PasswordFields.password.name}
                  placeholder={PasswordFields.password.placeholder}
                  type={passwordMask ? 'password' : 'text'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <RemoveRedEye style={{cursor: 'pointer'}} onClick={this.togglePasswordMask} />
                      </InputAdornment>
                    ),
                  }}
                />
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
