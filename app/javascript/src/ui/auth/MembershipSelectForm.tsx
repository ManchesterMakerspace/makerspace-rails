import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import isUndefined from "lodash-es/isUndefined";

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
  title?: string;
  onSelect?: (membershipOption: Invoice) => void;
  redirectOnSelect?: boolean;
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
  stagedInvoices: CollectionOf<Invoice>;
}
interface State {
  membershipOption: Invoice;
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
      //TODO Update to actually find the chosen memberhip options
      membershipOption: this.props.stagedInvoices ? Object.values(this.props.stagedInvoices)[0] : undefined,
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
      cell: (row: Invoice) => {
        const selected = this.state.membershipOption && this.state.membershipOption.id === row.id;
        const variant = selected ? "contained" : "outlined";
        const label = selected ? "Selected" : "Select";

        return (
          <Button id={row.id} variant={variant} color="primary" onClick={this.selectMembershipOption}>{label}</Button>
        )
      }
    }
  ]
  private renderMembershipSelect = (): JSX.Element => {
    const { membershipOptions, invoiceOptionsError, invoiceOptionsLoading } = this.props;

    let normalizedError: JSX.Element = invoiceOptionsError && (
      <>
        Error reading membership options. Email <a href={`mailto: contact@manchestermakerspace.org`}>contact@manchestermakerspace.org</a> if your desired membership option is not present
      </>
    );
    return (
      <>
        <TableContainer
          id="membership-select-table"
          title={isUndefined(this.props.title) && "Select a Membership"}
          data={Object.values(membershipOptions)}
          columns={this.membershipColumns}
          rowId={this.rowId}
          loading={invoiceOptionsLoading}
        />
        <ErrorMessage error={normalizedError} />
      </>
        );
  }

  private selectMembershipOption = (event: React.MouseEvent<HTMLElement>) => {
    const membershipOption = this.props.membershipOptions[event.currentTarget.id]
    if (membershipOption) {
      this.setState({ membershipOption });
      this.props.resetStagedInvoice();
      this.props.stageInvoice(membershipOption);
      this.props.onSelect && this.props.onSelect(membershipOption);
      this.props.redirectOnSelect && this.setState({ redirect: true });
    }
  }

  public render(): JSX.Element {
    if (this.state.redirect) {
      return <Redirect to={Routing.SignUp} />
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

  const {
    invoices: stagedInvoices
  } = state.checkout;

  return {
    membershipOptions,
    invoiceOptionsLoading,
    invoiceOptionsError,
    stagedInvoices
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
