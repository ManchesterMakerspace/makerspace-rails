import * as React from "react";
import { connect } from "react-redux";

import { TextField, Grid, InputAdornment } from "@material-ui/core";

import { CollectionOf } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SignUpFields } from "ui/auth/constants";
import { SignUpForm } from "ui/auth/interfaces";
import ErrorMessage from "ui/common/ErrorMessage";
import { stageSignUpAction } from "ui/auth/actions";
import { RemoveRedEye } from "@material-ui/icons";
import Form from "ui/common/Form";

interface OwnProps {
}
interface DispatchProps {
  stageSignUp: (signUpForm: SignUpForm) => void;
}
interface StateProps {
  isRequesting: boolean;
  error: string;
}
interface State {
  passwordMask: boolean;
}
interface Props extends OwnProps, DispatchProps, StateProps { }

class SignUpFormComponent extends React.Component<Props, State> {
  private formRef: Form;
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

  private renderPasswordInput = (): JSX.Element => {
    const { passwordMask } = this.state;

    return (
      <TextField
        fullWidth
        required
        label={SignUpFields.password.label}
        name={SignUpFields.password.name}
        placeholder={SignUpFields.password.placeholder}
        type={passwordMask ? 'password' : 'text'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <RemoveRedEye style={{cursor: 'pointer'}} onClick={this.togglePasswordMask} />
            </InputAdornment>
          ),
        }}
      />
    )
  }

  private validateForm = (form: Form): SignUpForm => {
    const values = form.getValues();
    const errors: CollectionOf<string> = {};
    const validatedForm: Partial<SignUpForm> = {};

    Object.entries(SignUpFields).forEach(([key, field]) => {
      const value = values[field.name];
      if (field.validate(value)) {
        validatedForm[key] = value;
      } else {
        errors[field.name] = value;
      }
    });

    form.setFormState({
      errors,
    });

    return validatedForm as SignUpForm;
  }

  private submit = async (form: Form) => {
    const validSignUp: SignUpForm = this.validateForm(form);

    if (!form.isValid()) return;

    await this.props.stageSignUp(validSignUp);
  }

  public render(): JSX.Element {
    const { isRequesting, error } = this.props;

    return (
      <Form
        ref={this.setFormRef}
        id="sign-up"
        loading={isRequesting}
        title="Register"
        onSubmit={this.submit}
        submitText="Submit"
      >
        <Grid container spacing={24}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              label={SignUpFields.firstname.label}
              name={SignUpFields.firstname.name}
              placeholder={SignUpFields.firstname.placeholder}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              label={SignUpFields.lastname.label}
              name={SignUpFields.lastname.name}
              placeholder={SignUpFields.lastname.placeholder}
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          required
          label={SignUpFields.email.label}
          name={SignUpFields.email.name}
          placeholder={SignUpFields.email.placeholder}
          type="email"
        />
        {this.renderPasswordInput()}
        {!isRequesting && error && <ErrorMessage error={error} />}
      </Form>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const { isRequesting, error } = state.auth;

  return {
    isRequesting,
    error
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    stageSignUp: (signUpForm) => dispatch(stageSignUpAction(signUpForm))
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SignUpFormComponent);
