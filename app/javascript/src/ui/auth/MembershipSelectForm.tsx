import * as React from "react";
import { connect } from "react-redux";
import isUndefined from "lodash-es/isUndefined";

import { CollectionOf } from "app/interfaces";
import { InvoiceOption, InvoiceableResource } from "app/entities/invoice";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import ErrorMessage from "ui/common/ErrorMessage";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { numberAsCurrency } from "ui/utils/numberToCurrency";
import { Button } from "@material-ui/core";
import { readOptionsAction } from "ui/billing/actions";

interface OwnProps {
  title?: string;
  onSelect: (membershipOptionId: string) => void;
  membershipOptionId: string;
  redirectOnSelect?: boolean;
}
interface DispatchProps {
  getMembershipOptions: () => void;
}
interface StateProps {
  membershipOptions: CollectionOf<InvoiceOption>;
  invoiceOptionsLoading: boolean;
  invoiceOptionsError: string;
}

interface Props extends OwnProps, DispatchProps, StateProps { }

class MembershipSelectComponent extends React.Component<Props, {}> {

  private selectMembershipOption = (event: React.MouseEvent<HTMLTableElement>) => this.props.onSelect(event.currentTarget.id);

  public componentDidMount() {
    this.props.getMembershipOptions();
  }

  private rowId = (row: InvoiceOption) => row.id;
  private membershipColumns: Column<InvoiceOption>[] = [
    {
      id: "description",
      label: "Description",
      cell: (row: InvoiceOption) => row.description,
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: InvoiceOption) => numberAsCurrency(row.amount),
    },
    {
      id: "select",
      label: "",
      cell: (row: InvoiceOption) => {
        const selected = this.props.membershipOptionId === row.id;
        const variant = selected ? "contained" : "outlined";
        const label = selected ? "Selected" : "Select";

        return (
          <Button id={row.id} variant={variant} color="primary" onClick={this.selectMembershipOption}>{label}</Button>
        )
      }
    }
  ]

  public render(): JSX.Element {
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
  } = state.billing;

  return {
    membershipOptions,
    invoiceOptionsLoading,
    invoiceOptionsError,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    getMembershipOptions: () => dispatch(readOptionsAction({ types: [InvoiceableResource.Membership] })),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(MembershipSelectComponent);
