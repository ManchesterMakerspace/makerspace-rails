import { Props as FormFieldProps } from "../FormField";

export interface InputProps<T extends (string | number | boolean)> extends Omit<FormFieldProps<T>, "children"> {
  label: string;
  placeholder?: string;
  disabled?: boolean;
}