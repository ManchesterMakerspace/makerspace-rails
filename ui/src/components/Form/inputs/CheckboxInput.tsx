import * as React from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { FormField } from "../FormField";
import { InputProps } from "./types";
import ErrorMessage from "ui/common/ErrorMessage";

export const CheckboxInput = ({ 
  label, 
  fieldName, 
  defaultValue,
  required,
  disabled,
  ...props
}: InputProps<boolean>): JSX.Element => {
  return (
    <FormField
      fieldName={fieldName}
      defaultValue={defaultValue || false}
      required={!!required}
      {...props}
    >
      {(value, onChange) => (
        <FormControlLabel
          control={
            <Checkbox
              name={fieldName}
              id={fieldName}
              disabled={disabled}
              required={required}
              value={fieldName}
              checked={!!value}
              onChange={onChange}
              color="default"
            />
          }
          label={label}
        />
      )}
    </FormField>
  )
}