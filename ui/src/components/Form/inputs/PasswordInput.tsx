import * as React from "react";

import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Visibility from "@material-ui/icons/Visibility";
import { FormField } from "../FormField";
import { InputProps } from "./types";

interface Props extends InputProps<string> {
  autoComplete?: string;
}

export const PasswordInput = ({ 
  label, 
  fieldName, 
  placeholder,
  disabled,
  ...props
}: Props): JSX.Element => {
  const [mask, setMask] = React.useState(true);
  const toggleMask = React.useCallback(() => setMask(curr => !curr), [setMask]);

  return (
    <FormField
      fieldName={fieldName}
      required={true}
      {...props}
    >
      {(value, onChange, error) => (
        <TextField
          fullWidth
          required
          value={value}
          onChange={onChange}
          label={label}
          name={fieldName}
          error={!!error}
          disabled={!!disabled}
          id={fieldName}
          placeholder={placeholder}
          type={mask ? 'password' : 'text'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {mask ? 
                  <Visibility style={{cursor: 'pointer'}} onClick={toggleMask} /> :
                  <VisibilityOff style={{cursor: 'pointer'}} onClick={toggleMask} />
                }
              </InputAdornment>
            ),
          }}
        />
      )}
    </FormField>
  )
}