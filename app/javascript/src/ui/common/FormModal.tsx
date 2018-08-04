import * as React from "react";
import mapValues from "lodash-es/mapValues";
import omit from "lodash-es/omit";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
} from "@material-ui/core";

import { CollectionOf } from "app/interfaces";

import ErrorMessage from "ui/common/ErrorMessage";
import LoadingOverlay from "ui/common/LoadingOverlay";

interface OwnProps {
  formRef: (ref: any) => any;
  id: string;
  isOpen: boolean;
  title: string;
  closeHandler: () => void;
  submitText: string;
  onSubmit: (form) => void;
  loading: boolean;
}
interface FormModalProps extends OwnProps {}
interface State {
  values: CollectionOf<string>;
  errors: CollectionOf<string>;
  isDirty: boolean;
  touched: CollectionOf<boolean>;
}

type ChildNode = React.ReactElement<any>;

class FormModal extends React.Component<FormModalProps, State> {

  /**
   * Set values to collection of strings by input name
   */
  private getDefaultState = (props): State => {
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

  constructor(props) {
    super(props);
    this.state = this.getDefaultState(props);
  }

  public getValues = (): CollectionOf<string> => {
    return this.state.values;
  };

  public setFormState = (newState) => {
    this.setState(state => ({ ...state, ...newState}))
  };

  private handleSubmit = (event) => {
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

  private handleChange = (event) => {
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
    this.setState(this.getDefaultState(this.props));
    this.props.closeHandler()
  }

  private renderFormContent = (): JSX.Element => {
    const { submitText, title, id } = this.props;
    return (
      <>
        <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
        <DialogContent>
          {this.renderChildren()}
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="primary" type="submit">{submitText}</Button>
          <Button variant="outlined" onClick={this.closeForm}>Cancel</Button>
        </DialogActions>
      </>
    )
  }

  // Wrap form in loading icon w/ background blocker if loading
  public render(): JSX.Element {
    const { isOpen, id, loading, formRef } = this.props;

    return (
      <Dialog
        aria-labelledby={`${id}-title`}
        open={isOpen}
        onClose={this.closeForm}
      >
        <form 
          onSubmit={this.handleSubmit} 
          ref={formRef} 
          onChange={this.handleChange} 
          noValidate 
          className="form-modal"
        >
          {loading &&  <LoadingOverlay formId={id}/>}
          {this.renderFormContent()}
        </form>
      </Dialog>
    );
  }
}

export default FormModal;