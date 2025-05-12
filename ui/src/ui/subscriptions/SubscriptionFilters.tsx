import * as React from "react";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import { useQueryContext } from "../common/Filters/QueryContext";
import { withFilterButton } from "../common/FilterButton";
import { toDatePicker, dateToMidnight } from "../utils/timeToDate";
import useReadTransaction from "../hooks/useReadTransaction";
import { listBillingPlans, Plan } from "makerspace-ts-api-client";
import LoadingOverlay from "../common/LoadingOverlay";
import ErrorMessage from "../common/ErrorMessage";

export const subscriptionStatuses = {
  active: {
    label: "Active",
    value: "Active"
  },
  canceled: {
    label: "Canceled",
    value: "Canceled"
  },
  pastDue: {
    label: "Past Due",
    value: "Past Due"
  },
  pending: {
    label: "Pending",
    value: "Pending"
  },
  expired: {
    label: "Expired",
    value: "Expired"
  },
}

export enum SubscriptionFilter {
  Status = "subscriptionStatus",
  Search = "search",
  EndDate = "endDate",
  StartDate = "startDate",
  PlanId = "planId"
}

const SubscriptionFilters: React.FC<{ close: () => void, onChange: () => void }> = ({ close, onChange }) => {
  const { params, setParam } = useQueryContext();

  const { 
    data: billingPlans = [], 
    isRequesting: plansLoading, 
    error: plansError 
  } = useReadTransaction(listBillingPlans, {}, undefined);

  const onSearch = React.useCallback((event: React.KeyboardEvent<EventTarget>) => {
    if (event.key === "Enter") {
      const searchTerm = (event.target as HTMLInputElement).value;
      setParam(SubscriptionFilter.Search, searchTerm);
      onChange();
      close();
    }
  }, [setParam, onChange, close]);

  const onDateChange = React.useCallback((param: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setParam(param, dateToMidnight(value));
    onChange();
    close();
  }, [setParam, onChange, close]);

  const onCheckboxChange = React.useCallback((param: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.currentTarget;
    setParam(param, ((curr: string[]) => {
      if (checked) {
        return [...curr, value];
      } else {
        const updated = curr.slice();
        const valIndex = updated.indexOf(value);
        if (valIndex > -1) {
          updated.splice(valIndex, 1);
        }
        return updated;
      }
    }));
    onChange();
    close();
  }, [setParam, onChange, close]);


  const fallbackUI = (plansLoading && <LoadingOverlay  id="plans-loading" contained={true}/>) || 
                     (plansError && <ErrorMessage error={plansError} />);

  const {
    membershipPlans,
    rentalPlans
  } = React.useMemo(() => {
    const membershipPlans: Plan[] = [];
    const rentalPlans: Plan[] = [];
    billingPlans.forEach(plan => {
      if (plan.type === "rental") {
        rentalPlans.push(plan);
      } else {
        membershipPlans.push(plan);
      }
    });

    return { membershipPlans, rentalPlans };
  }, [billingPlans]);

  return (
    <>
      <Typography variant="subtitle1" gutterBottom>Subscription Filters</Typography>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Search for subscriptions</FormLabel>
          <TextField
            value={params.search}
            id="subscription-search-input"
            type="text"
            placeholder="Search..."
            onKeyPress={onSearch}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Filter by Subscription Start Due</FormLabel>
          <TextField
              value={toDatePicker(params.startDate)}
              name="start-date-filter"
              id="start-date-filter"
              type="date"
              onChange={onDateChange(SubscriptionFilter.StartDate)}
            />
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Filter by Subscription End Due</FormLabel>
          <TextField
              value={toDatePicker(params.endDate)}
              name="end-date-filter"
              id="end-date-filter"
              type="date"
              onChange={onDateChange(SubscriptionFilter.EndDate)}
            />
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Subscription status</FormLabel>
            <FormGroup>
              {Object.values(subscriptionStatuses).map(status => (
                <FormControlLabel
                  key={status.value}
                  control={<Checkbox checked={params.subscriptionStatus.includes(status.value)} onChange={onCheckboxChange(SubscriptionFilter.Status)} value={status.value} />}
                  label={status.label}
                />
              ))}
          </FormGroup>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1">Filter by Billing Plan</Typography>
      </Grid>
      <Grid item xs={12}>
        {fallbackUI || (
          <>
            <Grid item xs={12} style={{ marginBottom: "1em" }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Membership Plans</FormLabel>
                  <FormGroup>
                    {membershipPlans.map(plan => (
                      <FormControlLabel
                        key={plan.id}
                        control={<Checkbox checked={params.planId.includes(plan.id)} onChange={onCheckboxChange(SubscriptionFilter.PlanId)} value={plan.id} />}
                        label={plan.name}
                      />
                    ))}
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} style={{ marginBottom: "1em" }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Rental Plans</FormLabel>
                  <FormGroup>
                    {rentalPlans.map(plan => (
                      <FormControlLabel
                        key={plan.id}
                        control={<Checkbox checked={params.planId.includes(plan.id)} onChange={onCheckboxChange(SubscriptionFilter.PlanId)} value={plan.id} />}
                        label={plan.name}
                      />
                    ))}
                </FormGroup>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
    </>
  )

};

export default withFilterButton(SubscriptionFilters);
