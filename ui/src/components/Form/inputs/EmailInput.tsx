import * as React from "react";
import TextField from "@material-ui/core/TextField";
import { FormField } from "../FormField";
import { InputProps } from "./types";
import { emailValid } from "app/utils";

interface Props extends InputProps<string> {
  autoComplete?: string;
}

export const EmailInput = ({ 
  label, 
  fieldName, 
  placeholder,
  required,
  disabled,
  validate,
  ...props
}: Props): JSX.Element => {
  return (
    <FormField
      fieldName={fieldName}
      required={!!required}
      validate={validate || (val => !emailValid(val) && "Invalid email")}
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
          type="email"
        />
      )}
    </FormField>
  )
}