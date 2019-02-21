
import * as React from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { getRejectionCard } from "api/accessCards/transactions";
import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";

interface OwnProps {
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  createAccessCard: (uid: string) => void;
}

interface Props extends OwnProps {}
interface State {
  rejectionCardId: string;
  loading: boolean;
  error: string;
}

const defaultState = {
  rejectionCardId: "",
  loading: false,
  error: "",
};
export class AccessCardForm extends React.Component<Props,State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  constructor(props: Props) {
    super(props);
    this.state = defaultState;
  }

  public componentDidUpdate(prevProps: Props) {
    const { isOpen } = this.props;
    const { isOpen: wasOpen } = prevProps;
    if (!wasOpen && isOpen) {
      this.setState(defaultState);
    }
  }

  private fetchRejectionCard = () => {
    try {
      this.setState((state) => ({
        ...state,
        loading: true
      }), async () => {
        const rejectionCardResposne = await getRejectionCard();
        const { card } = rejectionCardResposne.data;
        this.setState({
          loading: false,
          error: "",
          rejectionCardId: card.uid
        })
      });
    } catch (error) {
      this.setState((state) => ({
        ...state,
        loading: false,
        error
      }))
    }
  }

  private renderNewCardInstructions = () => {
    return (
      <>
        <Typography variant="body1" gutterBottom>Instructions to register new member key fob</Typography>
        {this.renderImportInstructions()}
      </>
    )
  }

  private renderImportInstructions = () => {
    const { rejectionCardId } = this.state;
    return (
      <ol className="instruction-list">
        <li>Scan a new keyfob at the front door</li>
        <li>
          <div>Click the following button to import the new key fob's ID</div>
          <div>
            <Button
              id="card-form-import-new-key"
              color="primary"
              variant="contained"
              onClick={this.fetchRejectionCard}
            >
              Import New Key
            </Button>
          </div>
        </li>
        <li>Confirm new ID is displayed here:
          <span id="card-form-key-confirmation">
            {
              rejectionCardId ?
              <span style={{ color: "green" }}> {rejectionCardId}</span>
              : <span style={{ color: "red" }}> No Card Found</span>
            }
          </span>
        </li>
        <ul>
          <li>If 'No Card Found', check for error message in this form.  If no error, try steps 1 and 2 again</li>
          <li>If ID displayed, click 'Submit' button</li>
        </ul>
      </ol>
    )
  }

  private onSubmit = () => {
    const { rejectionCardId } = this.state;
    if (!rejectionCardId) {
      this.setState({ error: "Import new key fob before proceeding." });
      return;
    }
    this.props.createAccessCard(rejectionCardId);
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error } = this.props;
    const { loading, error: stateError } = this.state;

    return (
      <FormModal
        formRef={this.setFormRef}
        id="card-form"
        loading={isRequesting || loading}
        isOpen={isOpen}
        title="Register New Fob"
        closeHandler={onClose}
        onSubmit={this.onSubmit}
        error={error || stateError}
      >
        {this.renderNewCardInstructions()}
      </FormModal>
    )
  }
}

export default AccessCardForm;