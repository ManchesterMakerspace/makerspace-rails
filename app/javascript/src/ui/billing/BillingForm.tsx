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

import { InvoiceOption, InvoiceableResource } from "app/entities/invoice";
import { fields } from "ui/billing/constants";
import { BillingPlan } from "app/entities/billingPlan";
import { CollectionOf } from "app/interfaces";

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
}

class BillingForm extends React.Component<OwnProps, State>{
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: OwnProps) {
    super(props);
    this.state = {
      type: InvoiceableResource.Membership,
      planId: "",
      planMatchError: "",
    }
  }

  public componentDidMount() {
    this.props.getBillingPlans(this.state.type);
  }

  public componentDidUpdate(prevProps: OwnProps, prevState: State) {
    const { isOpen, option } = this.props;
    const { isOpen: wasOpen, option: oldOption } = prevProps;
    const { type, planId } = this.state;
    const { type: oldType, planId: oldPlanId } = prevState;
    if ((isOpen && !wasOpen) || //Reload plans on opening
      (type && type !== oldType) || // or if type changes
      (option && option.resourceClass !== oldOption.resourceClass && option.resourceClass !== type)) {// Or if option changed and resource doesn't match
      this.props.getBillingPlans(type);
    }
    if (planId && planId !== oldPlanId) { // Apply selected plan to form vlaues
      this.applyPlanToForm();
    }
  }

  private applyPlanToForm = () => {
    const { billingPlans } = this.props;
    const billingPlan = billingPlans[this.state.planId];

    const planToValues = Object.entries(billingPlan).reduce((obj, [key, val]) => {
      const field = fields[key];
      if (field) {
        obj[field.name] = val;
      }
      return obj;
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

  private renderPlanOptions = () => {
    const { plansLoading, plansError, billingPlans } = this.props;
    if (plansLoading) {
      return this.renderPlanOption({ id: "loading", name: "Loading...", value: "" });
    } else if (plansError) {
      return this.renderPlanOption({ id: "error", name: plansError, value: "" });
    }
    const plans = Object.entries(billingPlans);
    return plans.length ? [this.renderPlanOption({ id: "none", name: "None", value: "" })].concat(plans.map(
      ([key, plan]) => this.renderPlanOption({ id: key, name: plan.name, value: key }))) : this.renderPlanOption({ id: "no-items", name: "No plans available", value: "" })
  }

  private renderPlanOption = (field: { id: string, name: string, value: string }) => (
    <option id={`${fields.planId.name}-option-${field.id}`} key={field.id} value={field.value}>{field.name}</option>
  )

  public render() {
    const { isOpen, onClose, isRequesting, error, onSubmit, option, billingPlans } = this.props;
    const { type } = this.state;

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
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              value={option && option.name}
              disabled={option && !isUndefined(option.planId)}
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
              disabled={option && !isUndefined(option.planId)}
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
              disabled={option && !isUndefined(option.planId)}
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
              disabled={option && !isUndefined(option.planId)}
              label={fields.quantity.label}
              name={fields.quantity.name}
              placeholder={fields.quantity.placeholder}
            />
          </Grid>
        </Grid>
      </FormModal>
    )
  }
}

export default BillingForm;