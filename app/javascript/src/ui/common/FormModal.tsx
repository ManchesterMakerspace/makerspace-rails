import * as React from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  CircularProgress, 
} from "@material-ui/core";
import ErrorMessage from "ui/page/ErrorMessage";
import { CollectionOf } from "app/interfaces";
import { FormTypes } from "ui/common/constants";

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
  enhancedChildren: React.ReactNode;
  requiredFields: string[];
}

type ChildNode = React.ReactElement<any>;

const formStyle = {
  width: "600px"
}

class FormModal extends React.Component<FormModalProps, State> {

  constructor(props) {
    super(props);

    this.state = {
      enhancedChildren: props.children,
      requiredFields: this.readRequiredFieldsFromChildren(),
      values: this.readNamesFromChildren(),
      errors: {},
      touched: {},
      isDirty: false
    };
  }

  public componentDidUpdate(_prevProps: FormModalProps, prevState: State) {
    const { errors } = this.state;
    if (prevState.errors !== errors) this.assignErrorsToChildren(errors);
  }

  public getValues = () => {
    return this.state.values;
  };

  public setFormState = (newState) => {
    this.setState(state => ({ ...state, ...newState}))
  };

  /**
   * Get array of field names that are required in form
   */
  private readRequiredFieldsFromChildren = () => {
    const fields = React.Children.toArray(this.props.children);
    return fields.reduce((requiredFields, field: ChildNode) => {
      if (this.isFormInput(field) && field.props.required) {
        requiredFields.push(field.props.name);
      }
      return requiredFields;
    }, []);
  }

  /**
   * Re-render child components with updated error states
   */
  private assignErrorsToChildren = (errors: CollectionOf<string>) => {
    const errorNames = Object.keys(errors);
    const updatedChildren = React.Children.map(this.props.children, (child: ChildNode) => {
      // Only modify inputs
      if (this.isFormInput(child)) {
        const { name: fieldName } = child.props;
        if (errorNames.includes(fieldName)) {
          // Toggle error state if form has error for this field
          return React.cloneElement(child, { error: true, ...child.props })
        } 
        return React.cloneElement(child, { error: false, ...child.props })
      } else {
        return child;
      }
    });
    this.setState({ enhancedChildren: updatedChildren });
  }

  /**
   * Convert child nodes into collection by node name.
   * Only considers inputs that are included in FormTypes
   * 
   * @param children: Component props.children
   * @return inputs object
   */
  private readNamesFromChildren = () => {
    const inputs = {};
    const childArray = React.Children.toArray(this.props.children);
    childArray.reduce((inputs, child: React.ReactElement<any>) => {
      if (this.isFormInput(child)) {
        inputs[child.props.name] = child.props.defaultValue || ""
      }
      return inputs;
    }, inputs);
    return inputs;
  }

  private isFormInput = (child: ChildNode): boolean => {
    return child && FormTypes.has(child.type as React.ComponentType);
  }

  private handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ isDirty: true });
    this.props.onSubmit(this);
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
        }
      };
    });
  }

  /**
   * Add Error div for displaying errors.
   * Always added to hold space for error
   * Only displayed once child is considered touched
   */
  private renderChildren = (children: React.ReactNode): JSX.Element[] => {
    const { errors, touched } = this.state;
    return React.Children.map(children, (child: ChildNode) => {
      if (this.isFormInput(child)) {
        const fieldName = child.props.name;
        const isTouched = touched[fieldName];
        const error = errors[fieldName];
        return (
          <>
            {child}
            <ErrorMessage touched={isTouched} error={error}/>
          </>
        );
      }
      return child;
    });
  }

  public render(): JSX.Element {
    const { isOpen, closeHandler, submitText, title, id, formRef, loading } = this.props;
    const { enhancedChildren } = this.state;

    return (
      <Dialog
        aria-labelledby={`${id}-title`}
        open={isOpen}
        onClose={closeHandler}
      >
        <form 
          onSubmit={this.handleSubmit} 
          ref={formRef} 
          onChange={this.handleChange} 
          noValidate 
          style={formStyle}
        >
          <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
          <DialogContent>
            {
              loading ?
              <CircularProgress/>
              : this.renderChildren(enhancedChildren)
            }
            
          </DialogContent>

          <DialogActions>
            <Button variant="contained" color="primary" type="submit">{submitText}</Button>
            <Button variant="outlined" onClick={closeHandler}>Cancel</Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default FormModal;