import * as React from "react";
import Select from "@material-ui/core/Select";
import FormLabel from "@material-ui/core/FormLabel";
import { FormField } from "../FormField";
import { InputProps } from "./types";

interface Props<T extends string | number> extends InputProps<T> {
  options: SelectOption<T>[];
}

export interface SelectOption<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
  id?: string;
}

export const SelectInput: React.FC<Props<any>> = ({ 
  label, 
  fieldName, 
  placeholder,
  required,
  disabled,
  options,
  ...props
}: Props<any>): JSX.Element => {
  return (
    <FormField
      fieldName={fieldName}
      required={!!required}
      {...props}
    >
      {(value, onChange, error) => (
        <>
          <FormLabel component="legend">{label}</FormLabel>
          <Select
            name={fieldName}
            id={fieldName}
            error={!!error}
            fullWidth
            native
            value={value}
            onChange={onChange}
            required={required}
            disabled={!!disabled}
            placeholder={placeholder}
          >
            {options.map(({ label: optLabel, value: optValue, disabled: optDisabled, id }) => (
              <option 
                id={id || `${fieldName}-option-${optValue}`}
                key={optValue}
                value={optValue}
                disabled={!!optDisabled}
              >
                {optLabel}
              </option>
            ))}
          </Select>
        </>
      )}
    </FormField>
  );
};
