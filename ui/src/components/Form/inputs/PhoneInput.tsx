import * as React from "react";
import TextField from "@material-ui/core/TextField";
import { FormField } from "../FormField";
import { InputProps } from "./types";

export const PhoneInput = ({ 
  label, 
  fieldName, 
  placeholder,
  required,
  disabled,
  ...props
}: InputProps<string>): JSX.Element => {
  return (
    <FormField
      fieldName={fieldName}
      required={!!required}
      {...props}
    >
      {(value, onChange, error) => (
        <TextField
          fullWidth
          value={value}
          onChange={onChange}
          error={!!error}
          required={!!required}
          disabled={!!disabled}
          label={label}
          name={fieldName}
          id={fieldName}
          placeholder={placeholder}
          type="phone"
        />
      )}
    </FormField>
  )
}