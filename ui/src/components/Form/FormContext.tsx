import * as React from "react";
import { CollectionOf } from "app/interfaces";

export interface FormState {
  values: CollectionOf<any>;
  errors: CollectionOf<string>;
  isDirty: boolean;
  touched: CollectionOf<boolean>;
}

export interface FormContext extends FormState {
  setValue: <T extends unknown>(fieldName: string, value: T) => void;
  setError: (fieldName: string, error: string) => void;
  isValid: () => boolean;
  resetForm: () => void;
  validate: () => CollectionOf<string>;
  onSubmit: <K extends unknown>(event?: any) => K | void;
  registerField: (fieldName: string, validator?: Validator, transformer?: Transformer) => () => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}
type Validator = (value: any) => string | undefined;
type FieldRegisration = {
  [fieldName: string]: {
    validator: Validator,
  };
}

const defaultFormState = {
  values: {},
  errors: {},
  touched: {},
  isDirty: false,
  setValue: () => {},
  setError: () => {},
  resetForm: () => {},
  onSubmit: () => {},
  registerField: () => () => {},
  setFormState: () => {},
  isValid: () => false,
  validate: () => ({}),
};
const FormContext = React.createContext<FormContext>(defaultFormState);

interface Props {
  onSubmit?(state: FormState): void;
  validator?(values: CollectionOf<string>): CollectionOf<string>;
  hoistContext?(context: FormContext): void;
}

export const FormContextConsumer = FormContext.Consumer;

export const FormContextProvider: React.FC<Props> = ({ onSubmit, children, validator, hoistContext }) => {
  const [formState, setFormState] = React.useState<FormState>(defaultFormState);
  const [fieldRegistration, setFieldRegistration] = React.useState<FieldRegisration>({});

  const formContext = React.useMemo<FormContext>(() => {
    const validate = () => {
      const specificErrors = Object.entries(fieldRegistration).reduce((errors, [fieldName, fieldValidator]) => {
        const fieldError = fieldValidator.validator?.(formState.values[fieldName]);
        return { ...errors, ...fieldError && { [fieldName]: fieldError }};
      }, {});

      return {
        ...validator?.(formState.values) || {},
        ...specificErrors,
      };
    };
    
    return {
      ...formState,
      setFormState,
      setValue: (fieldName, value) => {
        setFormState(curr => ({
          ...curr,
          values: {
            ...curr.values,
            [fieldName]: value
          }
        }));
      },
      setError: (fieldName, error) => {
        setFormState(curr => ({
          ...curr,
          errors: {
            ...curr.errors,
            [fieldName]: error
          }
        }));
      },
      isValid: () => Object.values(formState.errors).filter(err => !!err).length === 0,
      resetForm: () => setFormState(defaultFormState),
      onSubmit: (event: any) => {
        event?.preventDefault();
        const errors = validate();

        setFormState(state => ({
          ...state,
          errors,
          isDirty: true,
          touched: Object.keys(fieldRegistration).reduce((touched, fieldName) => ({
            ...touched,
            [fieldName]: true
          }), {})
        }));

        const fieldHavingError = Object.entries(errors).find(([fieldName, error]) => !!error);
        if (fieldHavingError) {
          const field = document.getElementById(fieldHavingError[0]);
          field?.scrollIntoView(true);
          field?.focus();
          return;
        }

        return onSubmit(formState);
      },
      registerField: (fieldName: string, validator?: Validator) => {
        setFieldRegistration(curr => ({
          ...curr,
          [fieldName]: {
            validator,
          }
        }));
        return () => {
          setFieldRegistration(curr => ({
            ...curr,
            [fieldName]: undefined
          }));
        }
      },
      validate,
    }
  }, [formState, setFormState, onSubmit, setFieldRegistration, fieldRegistration, validator]);

  React.useEffect(() => {
    hoistContext?.(formContext);
  }, [formContext]);

  return (
    <FormContext.Provider value={formContext}>
      {children}
    </FormContext.Provider>
  )
}

export const useFormContext = () => {
  return React.useContext(FormContext);
}

export const useFormValues = () => {
  const { values } = useFormContext();
  return values;
}