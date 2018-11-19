import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";

import Grid from "@material-ui/core/Grid";

import { CollectionOf } from "app/interfaces";
import { Routing } from "app/constants";
import { Invoice } from "app/entities/invoice";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import ErrorMessage from "ui/common/ErrorMessage";
import { getMembershipOptionsAction } from "ui/invoices/actions";
import { Action as CheckoutAction } from "ui/checkout/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { numberAsCurrency } from "ui/utils/numberToCurrency";
import { Button } from "@material-ui/core";

interface OwnProps {
}
interface DispatchProps {
  stageInvoice: (membershipOption: Invoice) => void;
  getMembershipOptions: () => void;
  resetStagedInvoice: () => void;
}
interface StateProps {
  membershipOptions: CollectionOf<Invoice>;
  invoiceOptionsLoading: boolean;
  invoiceOptionsError: string;
}
interface State {
  passwordMask: boolean;
  emailExists: boolean;
  redirect: boolean;
}

interface Props extends OwnProps, DispatchProps, StateProps { }

class MembershipSelectComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      passwordMask: true,
      emailExists: false,
      redirect: false,
    };
  }

  public componentDidMount() {
    this.props.getMembershipOptions();
    this.props.resetStagedInvoice();
  }

  private rowId = (row: Invoice) => row.id;
  private membershipColumns: Column<Invoice>[] = [
    {
      id: "description",
      label: "Description",
      cell: (row: Invoice) => row.description,
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: Invoice) => numberAsCurrency(row.amount),
    },
    {
      id: "select",
      label: "",
      cell: (row: Invoice) => <Button id={row.id} variant="raised" color="primary" onClick={this.selectMembershipOption}>Select</Button>
    }
  ]
  private renderMembershipSelect = (): JSX.Element => {
    const { membershipOptions, invoiceOptionsError, invoiceOptionsLoading } = this.props;

    let normalizedError: JSX.Element = invoiceOptionsError && (
      <>
        Error reading membership options. <a href={`mailto: contact@manchestermakerspace.org`}>Email contact@manchestermakerspace.org</a> if your desired membership option is not present
      </>
    );
    return (
      <Grid item xs={12}>
        <TableContainer
          id="membership-select-table"
          title="Select a Membership"
          data={Object.values(membershipOptions)}
          columns={this.membershipColumns}
          rowId={this.rowId}
          loading={invoiceOptionsLoading}
        />
        <ErrorMessage error={normalizedError} />
      </Grid>
    );
  }

  private selectMembershipOption = (event: React.MouseEvent<HTMLElement>) => {
    const membershipOption = this.props.membershipOptions[event.currentTarget.id]
    this.props.resetStagedInvoice();
    this.props.stageInvoice(membershipOption);
    this.setState({ redirect: true });
  }

  public render(): JSX.Element {
    if (this.state.redirect) {
      return <Redirect to={Routing.Checkout} />
    }

    return this.renderMembershipSelect();
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const {
    entities: membershipOptions,
    read: {
      isRequesting: invoiceOptionsLoading,
      error: invoiceOptionsError,
    }
  } = state.invoices;

  return {
    membershipOptions,
    invoiceOptionsLoading,
    invoiceOptionsError
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    stageInvoice: (membershipOption: Invoice) => dispatch({
      type: CheckoutAction.StageInvoicesForPayment,
      data: [membershipOption],
    }),
    getMembershipOptions: () => dispatch(getMembershipOptionsAction()),
    resetStagedInvoice: () => dispatch({ type: CheckoutAction.ResetStagedInvoices })
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(MembershipSelectComponent);
