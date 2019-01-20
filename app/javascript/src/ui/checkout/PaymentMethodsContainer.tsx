import * as React from "react";

import Grid from "@material-ui/core/Grid";
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import PaymentMethodForm from "ui/checkout/PaymentMethodForm";
import { getPaymentMethods, deletePaymentMethod } from "api/paymentMethods/transactions";
import LoadingOverlay from "ui/common/LoadingOverlay";
import FormModal from "ui/common/FormModal";
import ErrorMessage from "ui/common/ErrorMessage";
import KeyValueItem from "ui/common/KeyValueItem";
import { PaymentMethod, isCreditCard } from "app/entities/paymentMethod";
import Form from "ui/common/Form";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";

interface OwnProps {
  onPaymentMethodChange: (newId: string) => void;
  selectedPaymentMethodId: string;
  managingMethods?: boolean;
  title?: string;
}
interface Props extends OwnProps {}
interface State {
  isRequesting: boolean;
  isDeleting: boolean;
  paymentMethods: PaymentMethod[];
  error: string;
  openAddPayment: boolean;
  openDeleteModal: boolean;
}

class PaymentMethods extends React.Component<Props, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  constructor(props: Props) {
    super(props);
    this.state = {
      isRequesting: false,
      isDeleting: false,
      paymentMethods: [],
      error: "",
      openAddPayment: false,
      openDeleteModal: false,
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

  private addNewPaymentMethod = () => {
    this.setState({ openAddPayment: true });
  }

  private closeAddPaymentMethod = () => {
    this.setState({ openAddPayment: false });
  }

  private onAddSuccess = (nonce: string) => {
    this.props.onPaymentMethodChange && this.props.onPaymentMethodChange(nonce);
    this.fetchPaymentMethods();
    this.closeAddPaymentMethod();
  }

  private selectPaymentMethod = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onPaymentMethodChange(event.currentTarget.value);
  }

  private renderAddPaymentForm = () => {
    return (
      <Dialog
        fullWidth={true}
        open={this.state.openAddPayment}
        onClose={this.closeAddPaymentMethod}
        style={{minHeight: 300}}
        disableBackdropClick={true}
      >
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <PaymentMethodForm closeHandler={this.closeAddPaymentMethod} onSuccess={this.onAddSuccess}/>
                {<Button variant="outlined" id="payment-method-cancel" onClick={this.closeAddPaymentMethod}>Cancel</Button>}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Dialog>
    );
  }

  private renderDeletePaymentModal = () => {
    const { isRequesting, isDeleting, error, openDeleteModal, paymentMethods } = this.state;
    const { selectedPaymentMethodId } = this.props;
    const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedPaymentMethodId);
    if (!selectedPaymentMethod) {
      return;
    }
    const paymentMethodInfo = isCreditCard(selectedPaymentMethod) ?
      (<KeyValueItem label={selectedPaymentMethod.cardType}>
        <span id="payment-method-info">{selectedPaymentMethod.cardType} ending in {selectedPaymentMethod.last4}</span>
      </KeyValueItem>) : <KeyValueItem label="PayPal">Username</KeyValueItem>
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
        <Typography gutterBottom>
          Are you sure you want to delete this payment method? This cannot be undone.
        </Typography>
        {paymentMethodInfo}
      </FormModal>
    )
  }

  private openDeleteModal = () => this.setState({ openDeleteModal: true });
  private closeDeleteModal = () => this.setState({ openDeleteModal: false });

  private deletePaymentMethod = async () => {
    const { selectedPaymentMethodId } = this.props;
    this.setState({ isDeleting: true });
    try {
      await deletePaymentMethod(selectedPaymentMethodId);
      this.setState({ isDeleting: false, error: "" });
      this.props.onPaymentMethodChange && this.props.onPaymentMethodChange(null);
      this.closeDeleteModal();
      this.fetchPaymentMethods();
    } catch (e) {
      this.setState({ isDeleting: false, error: e.errorMessage });
    }
  }

  private renderPaymentMethod = (paymentMethod: PaymentMethod) => {
    let label: string;
    if (isCreditCard(paymentMethod)) {
      label = `${paymentMethod.cardType} ending in ${paymentMethod.last4}`;
    } else {
      label = "PayPal";
    }
    return (
      <FormControlLabel
        id={`select-payment-method-${paymentMethod.id}`}
        key={paymentMethod.id}
        value={paymentMethod.id}
        control={<Radio color="primary" />}
        label={label}
      />
    )
  }

  private getActionButtons = () => {
    const { managingMethods, selectedPaymentMethodId } = this.props;
    const { isRequesting } = this.state;

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
    const { isRequesting, paymentMethods, error } = this.state;
    const { managingMethods, title, selectedPaymentMethodId } = this.props;

    return (
      <>
        <Grid container justify="center" spacing={16}>
          <Grid item xs={12}>
            <Typography variant="title" color="inherit">{title ? title : "Please Select a Payment Method"}</Typography>
          </Grid>
          <Grid item xs={12}>
              {isRequesting && <LoadingOverlay id="get-payment-methods" contained={true} /> ||
                Array.isArray(paymentMethods) && paymentMethods.length && (
                  <FormControl component="fieldset">
                    <RadioGroup
                      aria-label="Payment Method"
                      name="paymentMethodSelection"
                      value={selectedPaymentMethodId}
                      onChange={this.selectPaymentMethod}
                    >
                      {paymentMethods.map((paymentMethod) => (
                        this.renderPaymentMethod(paymentMethod)
                      ))}
                    </RadioGroup>
                    <ErrorMessage id={`get-payment-methods-error`} error={!isRequesting && error} />
                  </FormControl>
                ) ||
                  <Typography variant="body1" color="inherit" id="none-found">No payment methods found.  Click "Add New Payment Method" to add one.</Typography>
              }
          </Grid>
          <Grid item xs={12}>
              <ButtonRow actionButtons={this.getActionButtons()} />
          </Grid>
        </Grid>
        {this.renderAddPaymentForm()}
        {managingMethods && this.renderDeletePaymentModal()}
      </>
    );
  }
}

export default PaymentMethods;