import * as React from "react";
import AsyncSelect from 'react-select/lib/Async';
import isEmpty from "lodash-es/isEmpty";

import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Grid from "@material-ui/core/Grid";

import { Invoice, InvoiceableResource } from "app/entities/invoice";
import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";
import { fields } from "ui/invoice/constants";
import { toDatePicker } from "ui/utils/timeToDate";
import { getMembers, getMember } from "api/members/transactions";
import { MemberDetails } from "app/entities/member";

interface OwnProps {
  invoice?: Partial<Invoice>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}

interface State {
  invoiceType: InvoiceableResource;
  member: SelectOption;
}

type SelectOption = { label: string, value: string, id?: string };

class InvoiceForm extends React.Component<OwnProps, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: OwnProps) {
    super(props);
    this.state = {
      invoiceType: undefined,
      member: undefined,
    }
  }

  public componentDidUpdate(prevProps: OwnProps){
    const { isOpen: wasOpen } = prevProps;
    const { isOpen } = this.props;
    // Determine invoice type on open
    if (isOpen === !wasOpen) {
      this.resetInvoiceType();
      this.initInvoiceMember();
    }
  }

  public validate = async (form: Form): Promise<Invoice> => {
    const updatedInvoice = await form.simpleValidate<Invoice>(fields);
    const { member } = this.state;
    return {
      ...updatedInvoice,
      memberId: member.id || null,
    }
  }

  private resetInvoiceType = () => {
    this.setState({ invoiceType: (this.props.invoice && this.props.invoice.resourceClass) || InvoiceableResource.Membership})
  }

  private updateType = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Reset everything
    this.setState({ invoiceType: event.currentTarget.value as InvoiceableResource });
  }

  private initInvoiceMember = async () => {
    const { invoice } = this.props;
    if (invoice && invoice.memberId) {
      this.setState({ member: { value: invoice.memberId, label: invoice.memberName } })
      const response = await getMember(invoice.memberId);
      if (response.data && response.data.member) {
        this.updateContactValue(response.data.member);
      }
  }
}

  // Need to update internal state and set form value since input is otherwise a controleld input
  private updateContactValue = (newMember: SelectOption) => {
    this.setState({ member: newMember });
    this.formRef && this.formRef.setValue(fields.member.name, newMember);
  }

  private memberOptions = async (searchValue: string) => {
    try {
      const membersResponse = await getMembers({ search: searchValue });
      const members: MemberDetails[] = membersResponse.data ? membersResponse.data.members : [];
      const memberOptions = members.map(member => ({ value: member.email, label: `${member.firstname} ${member.lastname}`, id: member.id }));
      return memberOptions;
    } catch (e) {
      console.log(e);
    }
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, invoice } = this.props;

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
              <FormLabel component="legend">{fields.type.label}</FormLabel>
              <RadioGroup
                aria-label={fields.type.label}
                name={fields.type.name}
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
            <AsyncSelect
              isClearable
              name={fields.member.name}
              value={this.state.member}
              onChange={this.updateContactValue}
              placeholder={fields.member.placeholder}
              id={fields.member.name}
              loadOptions={this.memberOptions}
            />
          </Grid>
        {/* Who's it form - Member search */}
        {/* If can find resource, ask how long to renew for
        Else, display sub form to create the resource */}
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
              value={invoice && invoice.dueDate && toDatePicker(invoice.dueDate)}
              label={fields.dueDate.label}
              name={fields.dueDate.name}
              placeholder={fields.dueDate.placeholder}
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </FormModal>
    )
  }
}

export default InvoiceForm;
