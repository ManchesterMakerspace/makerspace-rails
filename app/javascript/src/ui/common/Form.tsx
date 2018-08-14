import * as React from "react";
import mapValues from "lodash-es/mapValues";
import isEmpty from "lodash-es/isEmpty";
import omit from "lodash-es/omit";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from "@material-ui/core";

import { CollectionOf } from "app/interfaces";

import ErrorMessage from "ui/common/ErrorMessage";
import LoadingOverlay from "ui/common/LoadingOverlay";


export interface FormField {
  label: string;
  name: string;
  placeholder: string;
  validate: (val: string) => boolean;
  error: string;
  render?: (value: string | number | object) => string | JSX.Element;
}

export interface FormFields {
  [key: string]: FormField
}

interface FormModalProps {
  id: string;
  title: string;
  onCancel?: () => void;
  cancelText?: string;
  onSubmit: (form: Form) => void;
  submitText?: string;
  loading: boolean;
  children?: React.ReactNode;
}
interface State {
  values: CollectionOf<string>;
  errors: CollectionOf<string>;
  isDirty: boolean;
  touched: CollectionOf<boolean>;
}

type ChildNode = React.ReactElement<HTMLFormElement>;

class Form extends React.Component<FormModalProps, State> {

  /**
   * Set values to collection of strings by input name
   */
  private getDefaultState = (props: FormModalProps): State => {
    const formInputs = React.Children.toArray(props.children).filter((child: ChildNode) => {
      return this.isFormInput(child);
    });
    const defaultValues = formInputs.reduce((values: CollectionOf<string>, input: ChildNode) => {
      values[input.props.name] = input.props.defaultValue || "";
      return values;
    }, {});

    return (
      {
        values: defaultValues,
        errors: {},
        touched: {},
        isDirty: false
      }
    )
  }

  constructor(props: FormModalProps) {
    super(props);
    this.state = this.getDefaultState(props);
  }

  public getValues = (): CollectionOf<string> => {
    return this.state.values;
  };

  public setFormState = (newState: Partial<State>) => {
    this.setState(state => ({ ...state, ...newState}))
  };

  public isValid = (): boolean => {
    return isEmpty(this.state.errors);
  }

  private handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.setState(state => {
      return {
        isDirty: true,
        touched: mapValues(state.values, () => true)
      };
    }, () => {
      this.props.onSubmit(this);
    }
  );
  }

  private handleChange = (event: React.ChangeEvent<HTMLFormElement>) => {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;
    const { isDirty } = this.state;
    if (!isDirty) {
      this.setState({ isDirty: true });
    }
    this.setState((state) => {
      return {
        values: {
          ...state.values,
          [fieldName]: fieldValue
        },
        touched: {
          ...state.touched,
          [fieldName]: true
        },
        errors: {
          ...omit(state.errors, [fieldName])
        }
      };
    });
  }

  private isFormInput = (element: ChildNode): boolean => {
    return element && element.hasOwnProperty("props") && element.props.hasOwnProperty("name");
  }

  /**
   * Add Error div for displaying errors.
   * Always added to hold space for error
   * Only displayed once child is considered touched
   */
  private renderChildren = (): JSX.Element[] => {
    const { children, id: formId, } = this.props;
    const { values, errors, touched, isDirty } = this.state;
    return React.Children.map(children, (child: ChildNode) => {
      if (this.isFormInput(child)) {
        const fieldName = child.props.name;
        const id = child.props.id || `${formId}-${fieldName}`;
        const isTouched = touched[fieldName];
        const error = errors[fieldName];
        const value = values[fieldName];

        const controlledInput = React.cloneElement(child, {
          ...child.props,
          error: !!error,
          id,
          value
        });
        return (
          <>
            {controlledInput}
            <ErrorMessage error={isDirty && isTouched && error}/>
          </>
        );
      }
      return child;
    });
  }

  private closeForm = () => {
    const { onCancel } = this.props;
    this.setState(this.getDefaultState(this.props));
    onCancel && onCancel();
  }

  private renderFormContent = (): JSX.Element => {
    const { submitText, cancelText, title, id, onCancel } = this.props;
    return (
      <>
        <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
        <DialogContent>
          {this.renderChildren()}
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="primary" type="submit">{submitText || "Submit"}</Button>
          {onCancel && <Button variant="outlined" onClick={this.closeForm}>{cancelText || "Cancel"}</Button>}
        </DialogActions>
      </>
    )
  }

  // Wrap form in loading icon w/ background blocker if loading
  public render(): JSX.Element {
    const { id, loading } = this.props;

    return (
      <Grid container style={{position: "relative", overflow: "hidden"}}>
        <form
          onSubmit={this.handleSubmit}
          onChange={this.handleChange}
          noValidate
          id={`${id}-form-modal`}
          style={{width: "100%"}}
        >
          {loading &&  <LoadingOverlay id={id}/>}
          {this.renderFormContent()}
        </form>
      </Grid>
    );
  }
}

export default Form;