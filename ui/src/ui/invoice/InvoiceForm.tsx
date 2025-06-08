import * as React from "react";

import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Grid from "@material-ui/core/Grid";

import { 
  adminListRentals, 
  listInvoiceOptions, 
  InvoiceOption, 
  isApiErrorResponse,
  InvoiceableResource
} from "makerspace-ts-api-client";

import { MemberInvoice, RentalInvoice } from "app/entities/invoice";
import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";
import { fields } from "ui/invoice/constants";
import { toDatePicker } from "ui/utils/timeToDate";
import MemberSearchInput from "../common/MemberSearchInput";
import OptionsList from "../common/OptionsList";

interface OwnProps {
  memberId: string;
  invoice?: Partial<MemberInvoice | RentalInvoice>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  allowCustomBilling: boolean;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}

interface State {
  applyDiscount: boolean;
  invoiceOptions: InvoiceOption[];
  invoiceType: InvoiceableResource | string;
}
interface Props extends OwnProps {}

export class InvoiceForm extends React.Component<Props, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: Props) {
    super(props);
    const { invoice } = props;
    this.state = {
      applyDiscount: false,
      invoiceOptions: [],
      invoiceType: invoice && invoice.resourceClass || InvoiceableResource.Member,
    }
  }

  public async componentDidMount(): Promise<void> {
    this.getInvoiceOptions();
  }

  public componentDidUpdate(prevProps: OwnProps, prevState: State){
    const { isOpen: wasOpen } = prevProps;
    const { isOpen } = this.props;
    // Determine invoice type on open
    if (isOpen === !wasOpen) {
      this.resetInvoiceType();
    }

    // Clear invoice option on type change
    if (prevState.invoiceType !== this.state.invoiceType) {
      this.formRef && this.formRef.setValue(fields.id.name, undefined);
    }
  }

  public getInvoiceOptions = async () => {
    const result = await listInvoiceOptions({});
    if (!isApiErrorResponse(result)) {
      this.setState({ invoiceOptions: result.data });
    }
  }

  public validate = async (form: Form): Promise<MemberInvoice | RentalInvoice> => {
    const { applyDiscount, invoiceOptions } = this.state;
    const updatedInvoice = await form.simpleValidate<MemberInvoice | RentalInvoice>(fields);
    const { memberId } = updatedInvoice;

    if (updatedInvoice.resourceClass === InvoiceableResource.Member) {
      updatedInvoice.resourceId = memberId;
    } else {
      updatedInvoice.resourceId = (updatedInvoice as any).rentalId;
    }

    if (!updatedInvoice.resourceId) {
      form.setError(fields.rentalId.name, fields.rentalId.error);
    }

    // Determine 
    const matchingIo = invoiceOptions.find(option => option.id === updatedInvoice.id);

    return {
      ...updatedInvoice,
      memberId: memberId || null,
      ...applyDiscount && matchingIo && { discountId: matchingIo.discountId }
    };
  }

  private resetInvoiceType = () => {
    this.setState({ invoiceType: (this.props.invoice && this.props.invoice.resourceClass) || InvoiceableResource.Member})
  }

  private updateType = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ invoiceType: event.currentTarget.value as InvoiceableResource });
  }

  private toggleDiscount = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ applyDiscount: event.currentTarget.checked });

  public render(): JSX.Element {
    const {
      isOpen, onClose, isRequesting, error,
      onSubmit, invoice, allowCustomBilling, memberId } = this.props;
    const { applyDiscount } = this.state;
    
    if (!invoice) {
      return null;
    }

    return (
      <FormModal
        formRef={this.setFormRef}
        id="invoice-form"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={invoice && invoice.id ? "Edit Invoice" : "Create Invoice"}
        onSubmit={onSubmit}
        submitText="Save"
        error={error}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">{fields.resourceClass.label}</FormLabel>
              <RadioGroup
                aria-label={fields.resourceClass.label}
                name={fields.resourceClass.name}
                value={this.state.invoiceType as string}
                onChange={this.updateType}
              >
                <FormControlLabel value={InvoiceableResource.Member} control={<Radio />} label="Membership" />
                <FormControlLabel value={InvoiceableResource.Rental} control={<Radio />} label="Rental" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormLabel component="legend">{fields.memberId.label}</FormLabel>
            <MemberSearchInput
              name={fields.memberId.name}
              placeholder={fields.memberId.placeholder}
              initialSelection={invoice && { value: invoice.memberId, label: invoice.memberName, id: invoice.memberId }}
              getFormRef={() => this.formRef}
              disabled={invoice && !!invoice.memberId}
            />
          </Grid>
          {this.state.invoiceType === InvoiceableResource.Rental && (
            <Grid item xs={12}>
              <FormLabel component="legend">{fields.rentalId.label}</FormLabel>
              <OptionsList
                getFormRef={() => this.formRef}
                fieldname={fields.rentalId.name}
                initialValue={invoice.resourceId}
                placeholder={fields.rentalId.placeholder}
                apiFunction={adminListRentals}
                args={{ ...(memberId && { memberId }) }}
                mapOption={rental => ({
                  id: `${fields.rentalId.name}-option-${rental.id}`,
                  value: rental.id,
                  label: rental.number
                })}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <FormLabel component="legend">{fields.id.label}</FormLabel>
            <OptionsList
              getFormRef={() => this.formRef}
              fieldname={fields.id.name}
              initialValue={invoice && invoice.planId}
              placeholder={fields.id.placeholder}
              apiFunction={listInvoiceOptions}
              args={{ types: [this.state.invoiceType] }}
              mapOption={invoice => ({
                id: `${fields.id.name}-option-${invoice.id}`,
                value: invoice.id,
                label: invoice.name
              })}
            />
          </Grid>
          {/* Who's it for - Member search */}
          {/* If can find resource, ask how long to renew for
        Else, display sub form to create the resource */}
          {allowCustomBilling && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  value={invoice && invoice.description}
                  label={fields.description.label}
                  name={fields.description.name}
                  placeholder={fields.description.placeholder}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  value={invoice && invoice.amount}
                  label={fields.amount.label}
                  name={fields.amount.name}
                  placeholder={fields.amount.placeholder}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  value={invoice && toDatePicker(invoice.dueDate)}
                  label={fields.dueDate.label}
                  name={fields.dueDate.name}
                  placeholder={fields.dueDate.placeholder}
                  type="date"
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
            </>
          )}
          {this.state.invoiceType === InvoiceableResource.Member && (
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name={fields.discount.name}
                    value={fields.discount.name}
                    checked={applyDiscount}
                    onChange={this.toggleDiscount}
                    disabled={isRequesting}
                    color="default"
                  />
                }
                label={fields.discount.label}
              />
            </Grid>
          )}
        </Grid>
      </FormModal>
    );
  }
}

export default InvoiceForm;
