import * as React from "react";
import isUndefined from "lodash-es/isUndefined";

import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Grid from "@material-ui/core/Grid";
import Select from "@material-ui/core/Select";

import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";

import { InvoiceOption, InvoiceableResource, Properties as InvoiceOptionProps } from "app/entities/invoice";
import { Properties as BillingPlanProps } from "app/entities/billingPlan";
import { fields } from "ui/billing/constants";
import { BillingPlan } from "app/entities/billingPlan";
import { CollectionOf } from "app/interfaces";
import { Checkbox } from "@material-ui/core";

interface OwnProps {
  getBillingPlans: (type: InvoiceableResource) => void;
  billingPlans: CollectionOf<BillingPlan>;
  option?: Partial<InvoiceOption>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  plansLoading: boolean;
  plansError: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}

interface State {
  type: InvoiceableResource;
  planId: string;
  planMatchError: string;
  disableOption: boolean;
}

const defaultState = {
  type: InvoiceableResource.Membership,
  planId: "",
  planMatchError: "",
  disableOption: false
}
class BillingForm extends React.Component<OwnProps, State>{
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: OwnProps) {
    super(props);
    this.state = defaultState;
  }

  public componentDidMount() {
    this.getBillingPlans();
  }

  private getBillingPlans = () => this.props.getBillingPlans(this.state.type);

  public componentDidUpdate(prevProps: OwnProps, prevState: State) {
    const { isOpen, option, billingPlans } = this.props;
    const { isOpen: wasOpen, option: oldOption, billingPlans: oldPlans } = prevProps;
    const { type, planId } = this.state;
    const { type: oldType, planId: oldPlanId } = prevState;
    const optionType = option && option.resourceClass;
    const oldOptionType = oldOption && oldOption.resourceClass;
    // Reset on form open
    if (isOpen && !wasOpen) {
      this.setState(defaultState);
      if (option) {
        this.setState({ disableOption: option.disabled });
      }
    }
    // Reload plans if type changes
    if (type && type !== oldType) {
      this.getBillingPlans();
    }
    // Update form type if option changed and is out of sync
    if (optionType && optionType !== oldOptionType && optionType !== type) {
      this.setState({ type: optionType });
    }
    // Apply selected plan to form vlaues if a different plan was chosen
    if (planId && planId !== oldPlanId && planId !== option.planId) {
      this.applyPlanToForm();
    }
  }

  // Map of editable plan props to copy to option if option doesn't have them already
  private planToOptionMap = {
    [BillingPlanProps.Name]: InvoiceOptionProps.Name,
    [BillingPlanProps.Description]: InvoiceOptionProps.Description,
  }
  // Map of uneditable props to override option with
  private planOverridesMap = {
    [BillingPlanProps.Id]: InvoiceOptionProps.PlanId,
    [BillingPlanProps.BillingFrequency]: InvoiceOptionProps.Quantity,
    [BillingPlanProps.Amount]: InvoiceOptionProps.Amount,
  }

  private applyPlanToForm = () => {
    const { billingPlans } = this.props;
    const billingPlan = billingPlans[this.state.planId];

    const planToValues = Object.entries(billingPlan).reduce((invoiceOptionForm, [key, val]) => {
      // Convert billing plan key to option key
      const optionMap = this.planToOptionMap[key];
      const overrideMap = this.planOverridesMap[key];
        // Find related form field
      let field;
      if (optionMap) {
        const tmpField = fields[optionMap];
        // Only apply option map if no value
        if (tmpField && !this.formRef.getValues()[tmpField.name]) {
          field = tmpField
        }
      } else if (overrideMap) {
        field = fields[overrideMap];
      }
      if (field) {
        // Apply to form values update object
        invoiceOptionForm[field.name] = val;
      }
      return invoiceOptionForm;
    }, {});
    this.formRef.setFormState({ values: planToValues });
  }

  private updatePlanId = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ planId: event.currentTarget.value })
  }

  private updateType = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ type: event.currentTarget.value as InvoiceableResource });
  }

  public validate = async (form: Form): Promise<InvoiceOption> => {
    return await form.simpleValidate<InvoiceOption>(fields);
  }

  private toggleDisableOption = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => this.setState({ disableOption: checked });

  private renderPlanOptions = () => {
    const { plansLoading, plansError, billingPlans } = this.props;
    return this.renderOptions(plansLoading, plansError, billingPlans);
  }

  private renderPlanOption = (field: { id: string, name: string, value: string }) => (
    <option id={`${fields.planId.name}-option-${field.id}`} key={field.id} value={field.value}>{field.name}</option>
  )

  private getActivePlanId = () => {
    const { option } = this.props;
    const { planId } = this.state;
    return planId || (option && option.planId);
  }

  private renderDiscountOptions = () => {
    const { plansLoading, plansError, billingPlans } = this.props;
    const activePlanId = this.getActivePlanId()
    const foundPlan = billingPlans && billingPlans[activePlanId];
    if (!foundPlan) {
      return [];
    }
    const discounts = foundPlan.discounts.reduce((discounts, discount) => {
      discounts[discount.id] = discount;
      return discounts;
    }, {});
    return this.renderOptions(plansLoading, plansError, discounts);
  }

  private renderOptions = (loading: boolean, error: string, options: CollectionOf<any>) => {
    if (loading || !options) {
      return this.renderPlanOption({ id: "loading", name: "Loading...", value: "" });
    } else if (error) {
      return this.renderPlanOption({ id: "error", name: error, value: "" });
    }
    const plans = Object.entries(options);
    return plans.length ? [this.renderPlanOption({ id: "none", name: "None", value: "" })].concat(plans.map(
      ([key, plan]) => this.renderPlanOption({ id: key, name: plan.name, value: key }))) : this.renderPlanOption({ id: "no-items", name: "None available", value: "" })
  }

  public render() {
    const { isOpen, onClose, isRequesting, error, onSubmit, option } = this.props;
    const { type, planId, disableOption } = this.state;
    console.log(this.formRef && this.formRef.getValues());
    return (
      <FormModal
        formRef={this.setFormRef}
        id="invoice-form"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={(option && option.id) ? "Edit Billing Option" : "Create Billing Option"}
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
                value={type as string}
                onChange={this.updateType}
              >
                <FormControlLabel value={InvoiceableResource.Membership} control={<Radio />} label="Membership" />
                <FormControlLabel value={InvoiceableResource.Rental} control={<Radio />} label="Rental" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormLabel component="legend">{fields.planId.label}</FormLabel>
            <Select
              name={fields.planId.name}
              value={option && option.planId}
              onChange={this.updatePlanId}
              fullWidth
              native
              required
              placeholder={fields.planId.placeholder}
            >
              {this.renderPlanOptions()}
            </Select>
          </Grid>
          {!!this.getActivePlanId() && (
            <Grid item xs={12}>
              <FormLabel component="legend">{fields.discountId.label}</FormLabel>
              <Select
                name={fields.discountId.name}
                value={option && option.discountId}
                fullWidth
                native
                required
                placeholder={fields.discountId.placeholder}
              >
                {this.renderDiscountOptions()}
              </Select>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              value={option && option.name}
              disabled={isRequesting}
              label={fields.name.label}
              name={fields.name.name}
              placeholder={fields.name.placeholder}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              value={option && option.description}
              disabled={isRequesting}
              label={fields.description.label}
              name={fields.description.name}
              placeholder={fields.description.placeholder}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              value={option && option.amount}
              disabled={isRequesting || !!planId || !!(option && option.planId)}
              label={fields.amount.label}
              name={fields.amount.name}
              placeholder={fields.amount.placeholder}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              value={option && option.quantity}
              disabled={isRequesting || !!planId || !!(option && option.planId)}
              label={fields.quantity.label}
              name={fields.quantity.name}
              placeholder={fields.quantity.placeholder}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name={fields.disabled.name}
                  value={fields.disabled.name}
                  checked={disableOption}
                  onChange={this.toggleDisableOption}
                  disabled={isRequesting}
                  color="default"
                />
              }
              label={fields.disabled.label}
            />
          </Grid>
        </Grid>
      </FormModal>
    )
  }
}

export default BillingForm;