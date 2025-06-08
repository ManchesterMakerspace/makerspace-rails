import React from "react";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

import { CollectionOf } from "app/interfaces";
import ErrorMessage from "ui/common/ErrorMessage";
import LoadingOverlay from "ui/common/LoadingOverlay";
import { FormContext, FormContextProvider, FormState, useFormContext } from "./FormContext";

interface Props<V> {
  id: string;
  title?: string;
  onCancel?: () => void;
  cancelText?: string;
  onSubmit?: (form: FormState) => void;
  validator?(values: CollectionOf<string>): CollectionOf<string>;
  submitText?: string;
  submitDisabled?: boolean;
  hideFooter?: boolean;
  loading?: boolean;
  error?: string;
  style?: { [key: string]: string };
  children: React.ReactChild | React.ReactChild[];
  hoistContext?(context: FormContext): void;
  className?: string;
}

const FormContent = <V extends unknown>({
  onSubmit, 
  submitText, 
  cancelText, 
  title, 
  id, 
  onCancel, 
  children, 
  error, 
  loading, 
  submitDisabled,
  hideFooter,
}: Props<V>): JSX.Element => {
  const form = useFormContext();

  const closeForm = React.useCallback(() => {
    form.resetForm();
    onCancel?.();
  }, [form.resetForm, onCancel]);

  return (
    <>
      {title && <DialogTitle id={`${id}-title`}>{title}</DialogTitle>}
      <DialogContent style={{ overflow: 'visible' }}>
        {children}

        <Grid container spacing={2} justify="center">
          <Grid item xs={12}>
            {form.isDirty && !loading && error && <ErrorMessage error={error} id={`${id}-error`}/>}
          </Grid>
        </Grid>
      </DialogContent>

      {!hideFooter && <DialogActions>
        {onSubmit && <Button variant="contained" form={id} id={`${id}-submit`} onClick={form.onSubmit} color="primary" type="submit" disabled={submitDisabled || loading}>{submitText || "Submit"}</Button>}
        {onCancel && <Button variant="outlined" id={`${id}-cancel`}  onClick={closeForm}>{cancelText || "Cancel"}</Button>}
      </DialogActions>}
    </>
  )
}

export const Form = <V extends unknown>(props: Props<V>) => {
  const {
    id,
    onCancel,
    onSubmit,
    loading,
    style,
    validator,
    hoistContext,
  } = props;

  const Wrapper = (onSubmit || onCancel) && <form
    noValidate
    autoComplete="off"
    id={id}
    style={{ width: "100%", ...style }}
    children={<>
      {loading && <LoadingOverlay id={id} />}
      <FormContent {...props} />
    </>}
  />;
  const Content = (<>
    {loading && <LoadingOverlay id={id} />}
      <FormContent {...props} />
  </>)

    return (
    <div style={{ position: 'relative' }}>
      <FormContextProvider 
        onSubmit={onSubmit} 
        validator={validator}
        hoistContext={hoistContext}
      >
        {Wrapper || Content}
      </FormContextProvider>
    </div>
  );
}

  // Form:
  // Creates a context that inputs register to
  // Smart builder
  // Validator
  // isValid
  // No need for reset form since unmounting Context will clear it
  // getValues, setValue, setError, isValid, handleSubmit, handleChange, 


  // Need FormField component to register
  // CHeckbox, text & date, select, async select, radio