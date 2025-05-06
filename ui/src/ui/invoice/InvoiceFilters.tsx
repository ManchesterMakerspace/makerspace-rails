import * as React from "react";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import { useQueryContext } from "../common/Filters/QueryContext";
import { withFilterButton } from "../common/FilterButton";

const InvoiceFilters: React.FC<{ close: () => void, onChange: () => void }> = ({ close, onChange }) => {
  const { params, setParam } = useQueryContext();

  const toggleRadio = React.useCallback(
    (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      let param;
      if (value === "true") {
        param = true;
      } else if (value === "false") {
        param = false;
      }
      setParam(key, param);
      onChange();
      close();
    }, [setParam, onChange, close]);

  const paramToVal = (param: any) => {
    return param === true ? "true" : param === false ? "false" : "both"
  }

  const onSearch = React.useCallback((event: React.KeyboardEvent<EventTarget>) => {
    if (event.key === "Enter") {
      const searchTerm = (event.target as HTMLInputElement).value;
      setParam("search", searchTerm);
      onChange();
      close();
    }
  }, [setParam, onChange, close]);

  return (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Invoice Filters
      </Typography>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Search for dues</FormLabel>
          <TextField id="invoice-search-input" type="text" placeholder="Search..." onKeyPress={onSearch} />
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Filter by Past Due</FormLabel>
          <RadioGroup name="pastDue" value={paramToVal(params.pastDue)} onChange={toggleRadio("pastDue")}>
            <FormControlLabel value="true" control={<Radio />} label="Past Due" />
            <FormControlLabel value="false" control={<Radio />} label="Not Past Due" />
            <FormControlLabel value="both" control={<Radio />} label="Both" />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Filter by Refunded</FormLabel>
          <RadioGroup name="refunded" value={paramToVal(params.refunded)} onChange={toggleRadio("refunded")}>
            <FormControlLabel value="true" control={<Radio />} label="Refunded" />
            <FormControlLabel value="false" control={<Radio />} label="Not Refunded" />
            <FormControlLabel value="both" control={<Radio />} label="Both" />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Filter by Refund Requested</FormLabel>
          <RadioGroup
            name="refundRequested"
            value={paramToVal(params.refundRequested)}
            onChange={toggleRadio("refundRequested")}
          >
            <FormControlLabel value="true" control={<Radio />} label="Requested" />
            <FormControlLabel value="false" control={<Radio />} label="Not Requestedd" />
            <FormControlLabel value="both" control={<Radio />} label="Both" />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Filter by Paid</FormLabel>
          <RadioGroup name="settled" value={paramToVal(params.settled)} onChange={toggleRadio("settled")}>
            <FormControlLabel value="true" control={<Radio />} label="Paid" />
            <FormControlLabel value="false" control={<Radio />} label="Unpaid" />
            <FormControlLabel value="both" control={<Radio />} label="Both" />
          </RadioGroup>
        </FormControl>
      </Grid>
    </>
  );

};

export default withFilterButton(InvoiceFilters);
