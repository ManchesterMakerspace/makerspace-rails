import * as React from "react";

import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import PaymentMethodForm from "ui/checkout/PaymentMethodForm";
import { getPaymentMethods, deletePaymentMethod } from "api/paymentMethods/transactions";
import LoadingOverlay from "ui/common/LoadingOverlay";
import FormModal from "ui/common/FormModal";
import ErrorMessage from "ui/common/ErrorMessage";
import { isCreditCard, isPaypal, AnyPaymentMethod } from "app/entities/paymentMethod";
import Form from "ui/common/Form";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";
import PaymentMethodComponent from "ui/checkout/PaymentMethod";
import { Subscription } from "app/entities/subscription";

interface OwnProps {
  onPaymentMethodChange?: (newId: string) => void;
  managingMethods?: boolean;
  title?: string;
  subscription?: Subscription;
}
interface Props extends OwnProps {}
interface State {
  isRequesting: boolean;
  isDeleting: boolean;
  paymentMethods: AnyPaymentMethod[];
  error: string;
  openAddPayment: boolean;
  openDeleteModal: boolean;
  selectedPaymentMethodId: string;
}

class PaymentMethodsContainer extends React.Component<Props, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  constructor(props: Props) {
    super(props);
    const { subscription } = props;
    this.state = {
      isRequesting: false,
      isDeleting: false,
      paymentMethods: [],
      error: "",
      openAddPayment: false,
      openDeleteModal: false,
      selectedPaymentMethodId: subscription && subscription.paymentMethodToken,
    };
  }

  public componentDidMount() {
    this.fetchPaymentMethods();
  }

  private fetchPaymentMethods = async () => {
    this.setState({ isRequesting: true, paymentMethods: [] });
    try {
      const { data } = await getPaymentMethods();
      this.setState({ isRequesting: false, paymentMethods: data.paymentMethods, error: "" });
    } catch (e) {
      this.setState({ isRequesting: false, error: e.errorMessage });
    }
  }

  private addNewPaymentMethod = () => this.setState({ openAddPayment: true });

  private closeAddPaymentMethod = () => this.setState({ openAddPayment: false });

  private onAddSuccess = (nonce: string) => {
    this.props.onPaymentMethodChange && this.props.onPaymentMethodChange(nonce);
    this.fetchPaymentMethods();
    this.closeAddPaymentMethod();
  }

  private selectPaymentMethod = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedPaymentMethodId = event.currentTarget.value;
    this.props.onPaymentMethodChange && this.props.onPaymentMethodChange(selectedPaymentMethodId);
    this.setState({ selectedPaymentMethodId })
  }

  private renderDeletePaymentModal = () => {
    const { isRequesting, isDeleting, error, openDeleteModal, paymentMethods, selectedPaymentMethodId } = this.state;
    const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedPaymentMethodId);
    if (!selectedPaymentMethod) {
      return;
    }
    return (
      <FormModal
        id="delete-payment-method-confirm"
        formRef={this.setFormRef}
        loading={isRequesting || isDeleting}
        isOpen={openDeleteModal}
        closeHandler={this.closeDeleteModal}
        title="Delete Payment Method"
        onSubmit={this.deletePaymentMethod}
        submitText="Delete"
        error={error}
      >
        <Grid container justify="center" spacing={16}>
          <Grid item xs={12}>
            <Typography gutterBottom>
              Are you sure you want to delete this payment method? This cannot be undone.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {this.renderPaymentMethod(selectedPaymentMethod)}
          </Grid>
        </Grid>
      </FormModal>
    )
  }

  private openDeleteModal = () => this.setState({ openDeleteModal: true });
  private closeDeleteModal = () => this.setState({ openDeleteModal: false });

  private deletePaymentMethod = async () => {
    const { selectedPaymentMethodId } = this.state;
    this.setState({ isDeleting: true });
    try {
      await deletePaymentMethod(selectedPaymentMethodId);
      this.setState({ isDeleting: false, error: "", selectedPaymentMethodId: undefined });
      this.props.onPaymentMethodChange && this.props.onPaymentMethodChange(null);
      this.closeDeleteModal();
      this.fetchPaymentMethods();
    } catch (e) {
      this.setState({ isDeleting: false, error: e.errorMessage });
    }
  }

  private renderPaymentMethod = (paymentMethod: AnyPaymentMethod, displayDelete: boolean = false, displayRadio: boolean = false): JSX.Element => {
    const label = <PaymentMethodComponent
      {...paymentMethod}
      key={`${paymentMethod.id}-label`}
      id={`select-payment-method-${paymentMethod.id}`}
    />;

    return displayRadio ? <FormControlLabel
            classes={{label: "flex"}}
            key={paymentMethod.id}
            value={paymentMethod.id}
            label={label}
            labelPlacement="end"
            control={<Radio color="primary"/>}
            /> : label;
  }

  private getActionButtons = () => {
    const { isRequesting, selectedPaymentMethodId } = this.state;
    const { managingMethods } = this.props;

    return ([
      ...managingMethods ? [{
        color: "secondary",
        variant: "outlined",
        id: "delete-payment-button",
        disabled: isRequesting || !selectedPaymentMethodId,
        onClick: this.openDeleteModal,
        label: "Delete Payment Method"
      }] : [],
      {
        color: "primary",
        variant: "contained",
        disabled: isRequesting,
        id: "add-payment-button",
        onClick: this.addNewPaymentMethod,
        label: "Add New Payment Method"
      }
    ] as ActionButton[])
  }


  public render(): JSX.Element {
    const { isRequesting, paymentMethods, error, selectedPaymentMethodId, openAddPayment } = this.state;
    const { managingMethods, title } = this.props;

    return (
      <>
        <Grid container justify="center" spacing={16}>
          <Grid item xs={12}>
            <Typography variant="h6" color="inherit">{title ? title : "Please Select a Payment Method"}</Typography>
          </Grid>
        </Grid>
        <Grid container justify="flex-start" spacing={16}>
          {isRequesting && <LoadingOverlay id="get-payment-methods" contained={true} /> ||
            Array.isArray(paymentMethods) && paymentMethods.length && (
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth={true}>
                  <RadioGroup
                    aria-label="Payment Method"
                    name="paymentMethodSelection"
                    value={selectedPaymentMethodId}
                    onChange={this.selectPaymentMethod}
                  >
                    {paymentMethods.map((paymentMethod) => (
                      this.renderPaymentMethod(paymentMethod, managingMethods, true)
                    ))}
                  </RadioGroup>
                </FormControl>
            </Grid>
            ) ||
            <Grid item xs={12}>
              <Typography variant="body1" color="inherit" id="none-found">No payment methods found.  Click "Add New Payment Method" to add one.</Typography>
            </Grid>
          }
          <ErrorMessage id={`get-payment-methods-error`} error={!isRequesting && error} />
          <Grid item xs={12}>
              <ButtonRow actionButtons={this.getActionButtons()} />
          </Grid>
        </Grid>
        <PaymentMethodForm
          isOpen={openAddPayment}
          onSuccess={this.onAddSuccess}
          closeHandler={this.closeAddPaymentMethod}
        />
        {managingMethods && this.renderDeletePaymentModal()}
      </>
    );
  }
}

export default PaymentMethodsContainer;