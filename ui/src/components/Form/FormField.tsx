import * as React from "react";
import ErrorMessage from "ui/common/ErrorMessage";
import { useFormContext, useFormValues } from "./FormContext";

export interface Props<T extends (string | number | boolean)> {
  fieldName: string;
  children?: Children; // A FormField without children will act as a DataField only
  required?: boolean;
  defaultValue?: T;
  validate?(value: T): string | undefined;
  value?: T;
  onChange?(currValue: T) :void;
}

type OnChange = <K extends React.ChangeEvent<HTMLInputElement>>(event: K) => void;
type Children = <T extends (string | number | boolean)>(value: T, onChange: OnChange, error: string) => JSX.Element;

export function FormField<T extends (string | number | boolean)>({ 
  fieldName, 
  validate,
  defaultValue,
  required,
  value: propsValue,
  onChange: propsOnChange,
  children,
}: Props<T>) {
  const { touched, isDirty, errors, setFormState, setValue: setFormValue, registerField } = useFormContext();
  const { [fieldName]: currentVal } = useFormValues();
  const [value, setValue] = React.useState<T>(propsValue ?? currentVal ?? defaultValue ?? "");
  const [mounted, setMounted] = React.useState(false);

  const validator = React.useCallback((value: T) => {
    const validateErr = validate?.(value);
    return validateErr ||  (required && !value && "Required");
  }, [validate, required, fieldName]);

  // Attach field to Form
  React.useEffect(() => registerField(fieldName, validator), [fieldName, validator]);

  const updateValue = React.useCallback((value: T) => {
    setValue(value);
    setFormValue(fieldName, value);
  }, [fieldName, setFormValue, setValue]);

  // Sync props, form and controlled component
  React.useEffect(() => {
    value !== currentVal && setFormValue(fieldName, value);
  }, [value]);
  React.useEffect(() => {
    mounted && currentVal !== value ? updateValue(currentVal) : setMounted(true);
  }, [currentVal]);
  React.useEffect(() => {
    mounted && propsValue !== value ? updateValue(propsValue) : setMounted(true);
  }, [propsValue]);

  const onChange = React.useCallback<OnChange>((event) => {
    if (event && event.target) {
      const fieldName = event.target.name;
      // Set value depending on checked state for checkboxes and radios
      const fieldValue = (event.target.type === "checkbox" ? event.target.checked : event.target.value) as T;
      const fieldError = validator(fieldValue);
      
      setValue(fieldValue);
      propsOnChange?.(fieldValue);
      setFormState(curr => ({
        ...curr,
        isDirty: true,
        values: {
          ...curr.values,
          [fieldName]: fieldValue
        },
        touched: {
          ...curr.touched,
          [fieldName]: true
        },
        errors: {
          ...Object.entries(curr.errors).reduce((errors, [field, err]) => ({
            ...errors,
            ...field !== fieldName && { [field]: err } || { [field]: fieldError }
          }), {})
        }
      }));
    }
  }, [validator, propsOnChange, setValue, setFormState]);

  const isTouched = touched[fieldName];
  const error = errors[fieldName];

  return (
    <>
      {children?.(value, onChange, error) || null}
      {error && <ErrorMessage id={`${fieldName}-error`} error={isDirty && isTouched && error}/>}
    </>
  );
};
