import * as React from "react";

import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Select from "@material-ui/core/Select";
import Radio from "@material-ui/core/Radio";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";

import { Invoice, InvoiceableResource, InvoiceOption } from "app/entities/invoice";
import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";
import { fields } from "ui/invoice/constants";
import { toDatePicker } from "ui/utils/timeToDate";
import { getMembers, getMember } from "api/members/transactions";
import { MemberDetails } from "app/entities/member";
import { Rental } from "app/entities/rental";
import { getRentals } from "api/rentals/transactions";
import { CollectionOf } from "app/interfaces";
import AsyncSelectFixed from "ui/common/AsyncSelect";

interface OwnProps {
  invoice?: Partial<Invoice>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  allowCustomBilling: boolean;
  invoiceOptions: CollectionOf<InvoiceOption>;
  optionsLoading: boolean;
  optionsError: string;
  getInvoiceOptions: (type: InvoiceableResource) => void;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}

interface State {
  invoiceType: InvoiceableResource;
  member: SelectOption;
  rentals: Rental[];
  rentalsLoading: boolean;
  rentalsError: string;
}
interface Props extends OwnProps {}

type SelectOption = { label: string, value: string, id?: string };

export class InvoiceForm extends React.Component<Props, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: Props) {
    super(props);
    const { invoice } = props;
    this.state = {
      invoiceType: invoice && invoice.resourceClass || InvoiceableResource.Membership,
      member: undefined,
      rentals: [],
      rentalsLoading: false,
      rentalsError: "",
    }
  }

  public componentDidUpdate(prevProps: OwnProps, prevState: State){
    const { isOpen: wasOpen } = prevProps;
    const { isOpen, invoice } = this.props;
    // Determine invoice type on open
    if (isOpen === !wasOpen) {
      this.resetInvoiceType();
      this.initInvoiceMember();
      this.getRentals();
      this.props.getInvoiceOptions(invoice.resourceClass || this.state.invoiceType);
    }

    // Fetch new options on type change
    if (prevState.invoiceType !== this.state.invoiceType) {
      this.props.getInvoiceOptions(this.state.invoiceType);
    }
  }

  private getRentals = async () => {
    this.setState({ rentalsLoading: true });
    try {
      const response = await getRentals(true);
      this.setState({ rentalsLoading: false, rentals: response.data.rentals });
    } catch (e) {
      const { errorMessage } = e;
      this.setState({ rentalsLoading: false, rentalsError: errorMessage });
    }
  }

  public validate = async (form: Form): Promise<Invoice> => {
    const updatedInvoice = await form.simpleValidate<Invoice>(fields);
    const { member } = this.state;

    if (updatedInvoice.resourceClass === InvoiceableResource.Membership) {
      updatedInvoice.resourceId = member.id;
    } else {
      updatedInvoice.resourceId = (updatedInvoice as any).rentalId;
    }

    if (!updatedInvoice.resourceId) {
      form.setError(fields.rentalId.name, fields.rentalId.error);
    }

    return {
      ...updatedInvoice,
      memberId: member.id || null,
    }
  }

  private resetInvoiceType = () => {
    this.setState({ invoiceType: (this.props.invoice && this.props.invoice.resourceClass) || InvoiceableResource.Membership})
  }

  private updateType = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ invoiceType: event.currentTarget.value as InvoiceableResource });
  }

  private initInvoiceMember = async () => {
    const { invoice } = this.props;
    if (invoice && invoice.memberId) {
      this.setState({ member: { value: invoice.memberId, label: invoice.memberName } })
      const response = await getMember(invoice.memberId);
      if (response.data && response.data.member) {
        this.updateContactValue(this.memberToOption(response.data.member));
      }
    }
  }

  private memberToOption = (member: MemberDetails) => ({ value: member.email, label: `${member.firstname} ${member.lastname}`, id: member.id });

  // Need to update internal state and set form value since input is otherwise a controleld input
  private updateContactValue = (newMember: SelectOption) => {
    this.setState({ member: newMember });
    this.formRef && this.formRef.setValue(fields.member.name, newMember);
  }

  private memberOptions = async (searchValue: string) => {
    try {
      const membersResponse = await getMembers({ search: searchValue });
      const members: MemberDetails[] = membersResponse.data ? membersResponse.data.members : [];
      const memberOptions = members.map(this.memberToOption);
      return memberOptions;
    } catch (e) {
      console.log(e);
    }
  }

  public render(): JSX.Element {
    const {
      isOpen, onClose, isRequesting, error,
      onSubmit, invoice, allowCustomBilling,
      invoiceOptions, optionsError, optionsLoading } = this.props;
    const { rentals } = this.state;

    const rental = invoice && invoice.resourceId && invoice.resourceClass === InvoiceableResource.Rental &&
      (rentals || []).find(r => r.id === invoice.resourceId);

    if (!invoice) {
      return null;
    }

    const optionsList = Object.values(invoiceOptions);
    const invoiceOptionsList = optionsList.length ?
      [<MenuItem id={`${fields.invoiceOptionId.name}-option-none`} key="none" value={null}>None</MenuItem>,
        [...optionsList.map(
        (invoiceOption) =>
          <MenuItem
            id={`${fields.invoiceOptionId.name}-option-${invoiceOption.id}`}
            key={invoiceOption.id}
            value={invoiceOption.id}>
              {invoiceOption.name}
          </MenuItem>)
        ]]
      : <MenuItem id={`${fields.invoiceOptionId.name}-option-none`}>No Options</MenuItem>


    return (
      <FormModal
        formRef={this.setFormRef}
        id="invoice-form"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={(invoice && invoice.id) ? "Edit Invoice" : "Create Invoice"}
        onSubmit={onSubmit}
        submitText="Save"
        error={error}
      >
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">{fields.resourceClass.label}</FormLabel>
              <RadioGroup
                aria-label={fields.resourceClass.label}
                name={fields.resourceClass.name}
                value={this.state.invoiceType as string}
                onChange={this.updateType}
              >
                <FormControlLabel value={InvoiceableResource.Membership} control={<Radio />} label="Membership" />
                <FormControlLabel value={InvoiceableResource.Rental} control={<Radio />} label="Rental" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormLabel component="legend">{fields.member.label}</FormLabel>
            <AsyncSelectFixed
              isClearable
              name={fields.member.name}
              value={this.state.member}
              isDisabled={invoice && !!invoice.memberId}
              onChange={this.updateContactValue}
              placeholder={fields.member.placeholder}
              id={fields.member.name}
              loadOptions={this.memberOptions}
            />
          </Grid>
          {this.state.invoiceType === InvoiceableResource.Rental && <Grid item xs={12}>
            <FormLabel component="legend">{fields.rentalId.label}</FormLabel>
            <Select
              name={fields.rentalId.name}
              value={rental && rental.id || invoice.resourceId}
              fullWidth
              native
              required
              placeholder={fields.rentalId.placeholder}
            >
              {rentals.length ?
                rentals.map(
                  (rental) => <MenuItem id={`${fields.rentalId.name}-option-${rental.id}`} key={rental.id} value={rental.id}>{rental.number}</MenuItem>)
                : invoice && <MenuItem id={`${fields.rentalId.name}-option-${invoice.resourceId}`} value={invoice.resourceClass}>{invoice.resourceId}</MenuItem>
              }
            </Select>
          </Grid>}
          <Grid item xs={12}>
            <FormLabel component="legend">{fields.invoiceOptionId.label}</FormLabel>
            <Select
              name={fields.invoiceOptionId.name}
              fullWidth
              native
              required
              disabled={!optionsList.length}
              placeholder={fields.invoiceOptionId.placeholder}
            >
              {invoiceOptionsList}
            </Select>
          </Grid>
        {/* Who's it form - Member search */}
        {/* If can find resource, ask how long to renew for
        Else, display sub form to create the resource */}
          {allowCustomBilling &&
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
                  shrink: true,
                }}
              />
            </Grid>
          </>}
        </Grid>
      </FormModal>
    )
  }
}

export default InvoiceForm;
