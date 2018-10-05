
import * as React from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { AccessCard, CardStatus } from "app/entities/card";
import { getRejectionCard, putCard } from "api/accessCards/transactions";
import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";
import ButtonRow from "ui/common/ButtonRow";


interface OwnProps {
  cardId: string;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}

interface State {
  rejectionCardId: string;
  loading: boolean;
  error: string;
  cardDisabled: boolean;
}

class AccessCardForm extends React.Component<OwnProps,State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  constructor(props: OwnProps) {
    super(props);

    this.state = {
      rejectionCardId: "",
      loading: false,
      error: "",
      cardDisabled: false,
    };
  }

  private fetchRejectionCard = () => {
    try {
      this.setState((state) => ({
        ...state,
        loading: true
      }), async () => {
        const rejectionCardResposne = await getRejectionCard();
        const { data } = rejectionCardResposne;
        this.setState({
          loading: false,
          error: "",
          rejectionCardId: data.uid
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

  private reportLost = () => {
    const { cardId } = this.props;
    const cardDetails: Partial<AccessCard> = {
      id: cardId,
      validity: CardStatus.Lost
    };
    this.reportCard(cardDetails);
  }

  private reportStolen = () => {
    const { cardId } = this.props;
    const cardDetails: Partial<AccessCard> = {
      id: cardId,
      validity: CardStatus.Stolen
    };
    this.reportCard(cardDetails);
  }

  private reportCard = (cardDetails: Partial<AccessCard>) => {
    try {
      this.setState((state) => ({
        ...state,
        loading: true
      }), async () => {
        await putCard(cardDetails.id, cardDetails);
        this.setState({
          loading: false,
          error: "",
          cardDisabled: true,
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
        <li id="card-form-key-confirmation">Confirm new ID is displayed here: {
          rejectionCardId ? <span style={{color: "green"}}>{rejectionCardId}</span>
          : <span style={{color: "red"}}>No Card Found</span>}
        </li>
        <ul>
          <li>If 'No Card Found', check for error message in this form.  If no error, try steps again</li>
          <li>If ID displayed, click 'Submit' button</li>
        </ul>
      </ol>
    )
  }

  private renderCardReplacement = () => {
    const { loading, error: stateError, cardDisabled } = this.state;
    const { isRequesting, error } = this.props;
    const disabled = loading || isRequesting || !!error || !!stateError;

    return (
      <>
        <Typography variant="body1" gutterBottom>Instructions to replace member's key fob</Typography>
        {!cardDisabled && (
          <ol className="instruction-list">
            <li>
              <div>
                A member can only have 1 key fob active at a time.
                Before you can issue a new fob, please mark the current one as Lost or Stolen with the following buttons:
              </div>
              <div>
                <ButtonRow
                  actionButtons={[
                    {
                      id: "card-form-lost",
                      color: "primary",
                      variant: "contained",
                      onClick: this.reportLost,
                      label: "Lost",
                      disabled
                    },
                    {
                      id: "card-form-stolen",
                      color: "primary",
                      variant: "outlined",
                      onClick: this.reportStolen,
                      label: "Stolen",
                      disabled
                    }
                  ]}
                />
              </div>
            </li>
          </ol>
        )}
        {cardDisabled && (
          <>
            <Typography variant="body2" gutterBottom>Fob successfully disabled.  Please register new key fob</Typography>
            {this.renderImportInstructions()}
          </>
        )}
      </>
    )
  }

  private onSubmit = (form: Form) => {
    const { onSubmit } = this.props;
    const { rejectionCardId } = this.state;
    if (!rejectionCardId) {
      this.setState({ error: "Import new key fob before proceeding." });
      return;
    }
    onSubmit(form);
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, cardId } = this.props;
    const { loading, error: stateError } = this.state;

    return (
      <FormModal
        formRef={this.setFormRef}
        id="card-form"
        loading={isRequesting || loading}
        isOpen={isOpen}
        title={cardId ? "Replace Member's Fob" : "Register New Fob"}
        closeHandler={onClose}
        onSubmit={this.onSubmit}
        error={error || stateError}
      >
        { cardId && this.renderCardReplacement() || this.renderNewCardInstructions()}
      </FormModal>
    )
  }
}

export default AccessCardForm;