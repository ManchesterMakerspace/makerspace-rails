import * as React from "react";

import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Grid from "@material-ui/core/Grid";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";

import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";

import { InvoiceOption, InvoiceableResource } from "makerspace-ts-api-client";
import { Properties as InvoiceOptionProps } from "app/entities/invoice";
import { Properties as BillingPlanProps } from "app/entities/billingPlan";
import { fields } from "ui/billing/constants";
import { CollectionOf } from "app/interfaces";

import { BillingContext, Context } from "ui/billing/BillingContextContainer";
import { toDatePicker } from "ui/utils/timeToDate";

interface Props {
  option?: Partial<InvoiceOption>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}

interface OwnProps extends Props {
  context: Context;
}

interface State {
  type: InvoiceableResource;
  planId: string;
  planMatchError: string;
  disableOption: boolean;
  isPromotion: boolean;
}

const defaultState = {
  type: InvoiceableResource.Member,
  planId: "",
  planMatchError: "",
  disableOption: false,
  isPromotion: false
}
export class BillingFormComponent extends React.Component<OwnProps, State>{
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: OwnProps) {
    super(props);
    this.state = { ...defaultState };
  }

  public componentDidMount() {
    this.getBillingPlans();
  }

  private getBillingPlans = () => {
    const { context } = this.props;
    if (!context.plans.loading) {
      context.plans.refresh([this.state.type]);
    }
    if (!context.discounts.loading) {
      context.discounts.refresh([this.state.type]);
    }
  }

  public componentDidUpdate(prevProps: OwnProps, prevState: State) {
    const { isOpen, option } = this.props;
    const { isOpen: wasOpen, option: oldOption } = prevProps;
    const { type, planId } = this.state;
    const { type: oldType, planId: oldPlanId } = prevState;
    const optionType = option && option.resourceClass;
    const oldOptionType = oldOption && oldOption.resourceClass;
    // Reset on form open
    if (isOpen && !wasOpen) {
      this.setState({ planMatchError: "" });
      if (option) {
        this.setState({ disableOption: option.disabled, isPromotion: (option).isPromotion });
      }
    }
    // Reload plans if type changes
    if (type && type !== oldType) {
      this.formRef && this.formRef.resetForm();
      this.getBillingPlans();
    }
    // Update form type if option changed and is out of sync
    if (optionType && optionType !== oldOptionType && optionType !== type) {
      this.setState({ type: optionType as InvoiceableResource });
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
    [BillingPlanProps.Id]: InvoiceOptionProps.PlanId,
    [BillingPlanProps.BillingFrequency]: InvoiceOptionProps.Quantity,
    [BillingPlanProps.Amount]: InvoiceOptionProps.Amount,
  }

  private applyPlanToForm = () => {
    const { plans: { data: billingPlans } } = this.props.context;
    const billingPlan = billingPlans.find(plan => plan.id === this.state.planId);

    if (!billingPlan) { return; }

    const planToValues = Object.entries(billingPlan).reduce((invoiceOptionForm, [key, val]) => {
      // Convert billing plan key to option key
      const optionMap = this.planToOptionMap[key];
      // Find related form field
      const field = fields[optionMap];
      if (field) {
        let value = val;
        if (key === BillingPlanProps.Amount) {
          value -= billingPlan.discounts.reduce((amt, discount) => {
            return amt + Number(discount.amount);
          }, 0)
        }

        // Apply to form values update object
        invoiceOptionForm[field.name] = value;
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

  private toggleDisableOption = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ disableOption: event.currentTarget.checked });
  private togglePromotionOption = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ isPromotion: event.currentTarget.checked });

  private renderPlanOptions = () => {
    const { plans } = this.props.context;
    const plansCollection = plans.data.reduce((collection, plan) => {
      collection[plan.id] = plan;
      return collection;
    }, {});
    return this.renderOptions(plans.loading, plans.error, plansCollection);
  }

  private renderPlanOption = (field: { id: string, name: string, value: string }) => (
    <option id={`${fields.planId.name}-option-${field.id}`} key={field.id} value={field.value}>{field.name}</option>
  )

  private renderDiscountOptions = () => {
    const { discounts } = this.props.context;
    const discountsCollection = discounts.data.reduce((collection, discount) => {
      collection[discount.id] = discount;
      return collection;
    }, {});

    return this.renderOptions(discounts.loading, discounts.error, discountsCollection);
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
    const { type, planId, disableOption, isPromotion } = this.state;


    // TODO: The validation / when things are disabled doesn't make a lot of sense
    // Need to work out how selecting discounts & plans will relate to fields

    return (
      <FormModal
        formRef={this.setFormRef}
        id="invoice-option-form"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={(option && option.id) ? "Edit Billing Option" : "Create Billing Option"}
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
                value={type as string}
                onChange={this.updateType}
              >
                <FormControlLabel value={InvoiceableResource.Member} control={<Radio />} label="Membership" />
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
          <Grid item xs={12}>
            <TextField
              fullWidth
              value={option && toDatePicker(option.promotionEndDate)}
              label={fields.promotionEndDate.label}
              name={fields.promotionEndDate.name}
              placeholder={fields.promotionEndDate.placeholder}
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

const BillingForm = React.forwardRef(
  (props: Props, ref: any) => (
    <BillingContext.Consumer>
      {context => <BillingFormComponent {...props} context={context} ref={ref} />}
    </BillingContext.Consumer>
  )
);

export default BillingForm;