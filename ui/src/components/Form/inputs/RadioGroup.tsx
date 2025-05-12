import * as React from "react";
import MaterialRadioGroup from "@material-ui/core/RadioGroup";
import { FormField } from "../FormField";
import { InputProps } from "./types";
import ErrorMessage from "ui/common/ErrorMessage";

interface Props extends Omit<InputProps<string>, "label"> {
  children: JSX.Element | JSX.Element[];
  label?: string;
}

export const RadioGroup = ({ 
  label, 
  fieldName, 
  defaultValue,
  required,
  disabled,
  children,
  ...props
}: Props): JSX.Element => {
  return (
    <FormField
      fieldName={fieldName}
      defaultValue={defaultValue}
      required={!!required}
      {...props}
    >
      {(value, onChange, error) => (
        <MaterialRadioGroup
          name={fieldName}
          id={fieldName}
          value={value}
          onChange={onChange}
          defaultValue={defaultValue}
        >
          {children}
          {error && <ErrorMessage error={error} />}
        </MaterialRadioGroup>
      )}
    </FormField>
  )
}