import * as React from "react";
import isString from "lodash-es/isString";

import Grid from "@material-ui/core/Grid";

//@ts-ignore
import * as Braintree from "braintree-web";

import Form, { FormFields } from "ui/common/Form";
import ErrorMessage from "ui/common/ErrorMessage";
import HostedInput from "ui/checkout/HostedInput";
import { createPaymentMethod, isApiErrorResponse } from "makerspace-ts-api-client";
import { AnyPaymentMethod } from "app/entities/paymentMethod";

interface OwnProps {
  braintreeInstance: any;
  clientToken: string;
  toggleLoading: (on: boolean) => void;
  closeHandler: () => void;
  onSuccess?: (paymentMethod: AnyPaymentMethod) => void;
}

interface Props extends OwnProps {}

interface State {
  hostedFieldsInstance: any;
  braintreeError: Braintree.BraintreeError | string;
  inputErrors: { [key: string]: string };
}

const formPrefix = "credit-card-form";
const CreditCardFields: FormFields = {
  number: {
    label: "Credit or debit card number",
    name: `${formPrefix}-cardNumber`,
    placeholder: "4111 1111 1111 1111",
    validate: (val) => !!val
  },
  cvv: {
    label: "Security code",
    name: `${formPrefix}-csv`,
    placeholder: "123"
  },
  expirationDate: {
    label: "Expiration date",
    name: `${formPrefix}-expirationDate`,
    placeholder: "MM/YYYY"
  },
  postalCode: {
    label: "Zipcode",
    name: `${formPrefix}-zipcode`,
    placeholder: "90210"
  },
  cardholderName: {
    label: "Cardholder Name",
    name: `${formPrefix}-name`,
    placeholder: "Old MacDonald"
  }
}

class CreditCardForm extends React.Component<Props, State> {
  private formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  constructor(props: Props) {
    super(props);

    this.state = {
      hostedFieldsInstance: undefined,
      braintreeError: undefined,
      inputErrors: {}
    }
  }

  public componentDidMount() {
    this.props.braintreeInstance && this.initHostedFields();
  }

  public componentDidUpdate(prevProps: Props) {
    const { braintreeInstance } = this.props;
    const { braintreeInstance: prevBraintreeInstance } = prevProps;
    if (!prevBraintreeInstance && braintreeInstance) {
      this.initHostedFields();
    }
  }

  private validateField = (event: any, requireValid: boolean = false) => {
    const { emittedBy, fields } = event;
    const { isValid, isPotentiallyValid } = fields[emittedBy];
    let error: string;
    if ((!isValid && requireValid) || !isPotentiallyValid) {
      error = "Invalid value";
    } else {
      error = undefined;
    }
    this.setState(prevState => ({
      ...prevState,
      inputErrors: {
        ...prevState.inputErrors,
        [emittedBy]: error
      }
    }));
  }

  private initHostedFields = async () => {
    const { braintreeInstance, toggleLoading } = this.props;
    const { inputErrors } = this.state;
    if (Object.values(inputErrors).some(err => !!err)) {
      this.setState({ braintreeError: "Invalid inputs must be corrected before submitting" });
    }

    toggleLoading(true);
    try {
      await Braintree.hostedFields.create({
        client: braintreeInstance,
        styles: {},
        fields: Object.entries(CreditCardFields).reduce((fields, [key, field]) => {
          fields[key] = {
            selector: `#${field.name}`,
            placeholder: field.placeholder
          }
          return fields;
        }, {} as Braintree.HostedFieldFieldOptions),
      }, (err, hostedFieldsInstance: Braintree.HostedFields) => {
        if (err) throw err;
        hostedFieldsInstance.on("validityChange",(event) => {
          this.validateField(event);
        });
        hostedFieldsInstance.on("blur", (event) => {
          this.validateField(event, true);
        });
        this.setState({ hostedFieldsInstance: hostedFieldsInstance });
      });
    } catch (err) {
      this.setState({ braintreeError: err });
    } finally {
      toggleLoading(false);
    }
  }

  public requestPaymentMethod = () => {
    const { hostedFieldsInstance } = this.state;
    const { toggleLoading } = this.props;

    if (hostedFieldsInstance) {
      toggleLoading(true);
      hostedFieldsInstance.tokenize(async (err: Braintree.BraintreeError, payload:{ [key: string]: string }) => {
        if (err) {
          this.setState({ braintreeError: err });
          toggleLoading(false);
        } else {
          const result = await createPaymentMethod({ body: { paymentMethodNonce: payload.nonce, makeDefault: true } });

          if (isApiErrorResponse(result)) {
            this.setState({ braintreeError: result.error.message });
          } else {
            this.props.onSuccess && this.props.onSuccess(result.data);
            this.setState({ braintreeError: undefined });
          }
          toggleLoading(false);
        }
      });
    }
  }

  public render(): JSX.Element {
    const { braintreeError, inputErrors } = this.state;
    const error = braintreeError && (isString(braintreeError) ? braintreeError : braintreeError.message);

    return (
      <>
        <Form
          ref={this.setFormRef}
          onSubmit={this.requestPaymentMethod}
          onCancel={this.props.closeHandler}
          id="credit-card-form"
          title="Enter your credit or debit card information"
        >
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <HostedInput
                label={CreditCardFields.number.label}
                id={CreditCardFields.number.name}
              />
              {inputErrors["number"] &&
                <ErrorMessage error={inputErrors["number"]}/>
              }
            </Grid>
          </Grid>
          <Grid container spacing={8}>
            <Grid item xs={6}>
              <HostedInput
                label={CreditCardFields.expirationDate.label}
                id={CreditCardFields.expirationDate.name}
              />
              {inputErrors["expirationDate"] &&
                <ErrorMessage error={inputErrors["expirationDate"]}/>
              }
            </Grid>
            <Grid item xs={6}>
              <HostedInput
                label={CreditCardFields.cvv.label}
                id={CreditCardFields.cvv.name}
              />
              {inputErrors["cvv"] &&
                <ErrorMessage error={inputErrors["cvv"]}/>
              }
            </Grid>
          </Grid>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <HostedInput
                label={CreditCardFields.postalCode.label}
                id={CreditCardFields.postalCode.name}
              />
              {inputErrors["postalCode"] &&
                <ErrorMessage error={inputErrors["postalCode"]}/>
              }
            </Grid>
          </Grid>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <HostedInput
                label={CreditCardFields.cardholderName.label}
                id={CreditCardFields.cardholderName.name}
              />
              {inputErrors["cardholderName"] &&
                <ErrorMessage error={inputErrors["cardholderName"]} />
              }
            </Grid>
          </Grid>
          {error && <ErrorMessage error={error} id="credit-card-error"/>}
        </Form>
      </>
    )
  }
}

export default CreditCardForm;