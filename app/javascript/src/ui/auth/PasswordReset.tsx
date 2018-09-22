import * as React from "react";
import { RouteComponentProps, Redirect } from "react-router";

import { TextField, Grid, InputAdornment, Card, CardContent, Typography } from "@material-ui/core";
import { RemoveRedEye } from "@material-ui/icons";

import { Routing } from "app/constants";
import { putPassword } from "api/auth/transactions";
import Form, { FormFields } from "ui/common/Form";

interface OwnProps extends RouteComponentProps<any> {}
interface StateProps {}
interface Props extends OwnProps {}

interface State {
  passwordMask: boolean;
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
      passwordMask: true
    };
  }

  private togglePasswordMask = () => {
    this.setState((state) => ({ passwordMask: !state.passwordMask }));
  }

  private submit = async (form: Form) => {
    const { password } = await this.formRef.simpleValidate<PasswordForm>(PasswordFields);
    const { token } = this.props.match.params;
    await putPassword(token, password);
  }

  public render(): JSX.Element {
    const { passwordMask } = this.state;
    const { token } = this.props.match.params;

    if (!token) {
      return (
        <Redirect to={Routing.Root}/>
      )
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
                  label={PasswordFields.password.label}
                  name={PasswordFields.password.name}
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
              </Form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }
}

export default PasswordReset;