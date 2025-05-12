import * as React from "react";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { InputProps } from "./types";
import { FormField } from "../FormField";
import ErrorMessage from "ui/common/ErrorMessage";

export const HostedInput = ({ 
  label, 
  fieldName, 
  placeholder,
  required,
  disabled,
  ...props
}: InputProps<any>): JSX.Element => {
  return (
    <FormField
      fieldName={fieldName}
      required={!!required}
      {...props}
    >
      {(value, onChange, error) => (
        <>
        <FormControl
          fullWidth
          required
          >
          <FormLabel>
            {label} 
          </FormLabel>
          <div 
            id={fieldName}
            className="hosted-field"
          ></div>
        </FormControl>
        {error && <ErrorMessage error={error}/>}
        </>
      )}
    </FormField>
  );
};
