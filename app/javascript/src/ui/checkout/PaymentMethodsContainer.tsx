import * as React from "react";

import Grid from "@material-ui/core/Grid";
import Dialog from "@material-ui/core/Dialog";
import List from "@material-ui/core/List";
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
  onPaymentMethodChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
    this.setState({ isRequesting: true });
    try {
      const { data } = await getPaymentMethods();
      this.setState({ isRequesting: false, paymentMethods: data.paymentMethods });
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
                <PaymentMethodForm closeHandler={this.closeAddPaymentMethod}/>
                {<Button variant="outlined" id={`payment-method-cancel`} onClick={this.closeAddPaymentMethod}>Cancel</Button>}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Dialog>
    );
  }

  private renderDeletePaymentModal = () => {
    const { isRequesting, error, openAddPayment, paymentMethods } = this.state;
    const { selectedPaymentMethodId } = this.props;
    const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedPaymentMethodId);
    if (!selectedPaymentMethod) {
      return;
    }
    const paymentMethodInfo = isCreditCard(selectedPaymentMethod) ?
      (<KeyValueItem label={selectedPaymentMethod.cardType}>
        <span id="delete-invoice-contact">`${selectedPaymentMethod.cardType} ending in ${selectedPaymentMethod.last4}`</span>
      </KeyValueItem>) : <KeyValueItem label="PayPal">Username</KeyValueItem>
    return (
      <FormModal
        id="delete-invoice-confirm"
        formRef={this.setFormRef}
        loading={isRequesting}
        isOpen={openAddPayment}
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
      this.setState({ isDeleting: false });
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
      <FormControlLabel key={paymentMethod.id} value={paymentMethod.id} control={<Radio color="primary" />} label={label} />
    )
  }

  private getActionButtons = () => {
    const { managingMethods, selectedPaymentMethodId } = this.props;
    const { isRequesting } = this.state;

    return ([
      ...managingMethods ? [{
        color: "secondary",
        variant: "outlined",
        disabled: isRequesting || !selectedPaymentMethodId,
        onClick: this.openDeleteModal,
        label: "Delete Payment Method"
      }] : [],
      {
        color: "primary",
        variant: "contained",
        disabled: isRequesting,
        onClick: this.addNewPaymentMethod,
        label: "Add New Payment Method"
      }
    ] as ActionButton[])
  }


  public render(): JSX.Element {
    const { isRequesting, paymentMethods, error } = this.state;
    const { managingMethods, title } = this.props;

    return (
      <>
        <Grid container justify="center" spacing={16}>
          <Grid item xs={12}>
            <Typography variant="title" color="inherit">{title ? title : "Please Select a Payment Method"}</Typography>
            {isRequesting && <LoadingOverlay id="get-payment-methods" contained={true} />}
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="Payment Method"
                name="paymentMethodSelection"
                value={this.props.selectedPaymentMethodId}
                onChange={this.props.onPaymentMethodChange}
              >
                {Array.isArray(paymentMethods) && paymentMethods.map((paymentMethod) => (
                  this.renderPaymentMethod(paymentMethod)
                ))}
              </RadioGroup>
              <ErrorMessage id={`get-payment-methods-error`} error={!isRequesting && error} />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <ButtonRow actionButtons={this.getActionButtons()}/>
          </Grid>
        </Grid>
        {this.renderAddPaymentForm()}
        {managingMethods && this.renderDeletePaymentModal()}
      </>
    );
  }
}

export default PaymentMethods;