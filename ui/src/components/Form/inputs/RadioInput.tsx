import * as React from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import { FormField } from "../FormField";
import { InputProps } from "./types";
import ErrorMessage from "ui/common/ErrorMessage";

interface Props extends InputProps<string> {
  color: React.ComponentProps<typeof Radio>["color"];
}

export const RadioInput = ({ 
  label, 
  fieldName, 
  defaultValue,
  required,
  disabled,
  color,
  ...props
}: Props): JSX.Element => {
  return (
    <FormField
      fieldName={fieldName}
      defaultValue={defaultValue}
      required={!!required}
      {...props}
    >
      {(value, onChange) => (
        <FormControlLabel
          control={
            <Radio
              name={fieldName}
              id={fieldName}
              disabled={disabled}
              required={required}
              value={fieldName}
              checked={!!value}
              onChange={onChange}
              color={color}
            />
          }
          label={label}
        />
      )}
    </FormField>
  )
}