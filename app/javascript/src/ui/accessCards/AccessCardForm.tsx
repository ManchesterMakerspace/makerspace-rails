
import * as React from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { AccessCard, CardStatus } from "app/entities/card";
import { getRejectionCard, putCard } from "api/accessCards/transactions";
import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";
import ButtonRow from "ui/common/ButtonRow";
import { Column } from "ui/common/table/Table";
import { timeToDate } from "ui/utils/timeToDate";
import { MemberDetails } from "app/entities/member";

interface OwnProps {
  member: MemberDetails;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}

interface Props extends OwnProps {}
interface State {
  rejectionCardId: string;
  loading: boolean;
  error: string;
  cardDisabled: boolean;
}

const defaultState = {
  rejectionCardId: "",
  loading: false,
  error: "",
  cardDisabled: false,
};
const InactiveCardStatuses = [CardStatus.Lost, CardStatus.Stolen, CardStatus.Revoked];
export class AccessCardForm extends React.Component<Props,State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;
  private fields: Column<AccessCard>[] = [
    {
      id: "uid",
      label: "UID",
      cell: (row: AccessCard) => row.uid,
    },
    {
      id: "expiry",
      label: "Expiration",
      cell: (row: AccessCard) => row.expiry ? timeToDate(row.expiry) : "N/A",
    },
    {
      id: "validity",
      label: "Status",
      cell: (row: AccessCard) => {
        switch (row.validity) {
          case (CardStatus.Active || CardStatus.NonMember):
            return "Active";
          case CardStatus.Expired:
            return "Expired";
          default:
            return "Inactive";
        }
      }
    }
  ];
  private rowId = (row: AccessCard) => row.id;

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
    const { member } = this.props;
    const cardDetails: Partial<AccessCard> = {
      id: member.cardId,
      validity: CardStatus.Lost
    };
    this.reportCard(cardDetails);
  }

  private reportStolen = () => {
    const { member } = this.props;
    const cardDetails: Partial<AccessCard> = {
      id: member.cardId,
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
        <li>Confirm new ID is displayed here:
          <span id="card-form-key-confirmation">
            {
              rejectionCardId ?
              <span style={{ color: "green" }}>{rejectionCardId}</span>
              : <span style={{ color: "red" }}>No Card Found</span>
            }
          </span>
        </li>
        <ul>
          <li>If 'No Card Found', check for error message in this form.  If no error, try steps again</li>
          <li>If ID displayed, click 'Submit' button</li>
        </ul>
      </ol>
    )
  }

  private renderCardReplacement = () => {
    const { loading, cardDisabled } = this.state;
    const { isRequesting } = this.props;
    const disabled = loading || isRequesting;

    return (
      <>
        <Typography variant="body1" gutterBottom>Instructions to replace member's key fob</Typography>
        {!cardDisabled && (
          <ol className="instruction-list">
            <li>
              <div>
                A member can only have 1 key fob active at a time.
                Before you can issue a new fob, the current fob must be deactivated:
              </div>
              <div>
                <ButtonRow
                  actionButtons={[
                    {
                      id: "card-form-deactivate",
                      color: "primary",
                      variant: "contained",
                      onClick: this.reportLost,
                      label: "Deactivate",
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

  // private renderAllCards = () => {
  //   const { isRequesting, error, accessCards } = this.props;
  //   return (
  //     <TableContainer
  //       id="access-cards-table"
  //       title="Access Cards"
  //       loading={isRequesting}
  //       data={Object.values(accessCards)}
  //       error={error}
  //       totalItems={Object.values(accessCards).length}
  //       columns={this.fields}
  //       rowId={this.rowId}
  //     />
  //   )
  // }

  public validate = (form: Form): MemberDetails => {
    const { member } = this.props;
    const { rejectionCardId } = this.state;
    return {
      ...member,
      cardId: rejectionCardId
    };
  }

  private onSubmit = (form: Form) => {
    const { onSubmit, member } = this.props;
    const { rejectionCardId } = this.state;
    if (!rejectionCardId) {
      if (member.cardId) {
        this.setState({ error: "Deactivate current fob before proceeding." });
      } else {
        this.setState({ error: "Import new key fob before proceeding." });
      }
      return;
    }
    onSubmit(form);
  }

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, member } = this.props;
    const { loading, error: stateError } = this.state;
    const cardId = member.cardId;
    //TODO: Setup Basic/Advanced tabs in this modal
    // If advanced, display a table with all the member's cards
    // Basic is existing functionality
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