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
import { Button, FormControlLabel, Checkbox } from "@material-ui/core";
import { readOptionsAction } from "ui/billing/actions";

interface OwnProps {
  title?: string;
  onSelect: (membershipOptionId: string) => void;
  onDiscount: (discountId: string) => void;
  membershipOptionId: string;
  discountId: string;
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

class MembershipSelectComponent extends React.Component<Props> {

  private selectMembershipOption = (event: React.MouseEvent<HTMLTableElement>) => {
    const optionId = event.currentTarget.id;
    const option = this.getOption(optionId);
    this.updateOptionDiscount(option);
    this.props.onSelect(optionId)
  };

  private getOption = (id: string) => this.props.membershipOptions[id];
  private updateOptionDiscount = (option: InvoiceOption) => {
    if (this.props.discountId) { // Only want to update if
      (option.discountId && option.discountId !== this.props.discountId) && this.props.onDiscount(option.discountId);
    }
  }

  public componentDidMount() {
    this.props.getMembershipOptions();
  }

  private rowId = (row: InvoiceOption) => row.id;
  private membershipColumns: Column<InvoiceOption>[] = [
    {
      id: "name",
      label: "Name",
      cell: (row: InvoiceOption) => row.name,
    },
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

  private toggleDiscount = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const { membershipOptionId, onDiscount, membershipOptions } = this.props;
    let discountId;
    if (checked) { // Apply discount
      if (membershipOptionId) { // If option is already selected, find related discount and apply
        const membershipOption = membershipOptions[membershipOptionId];
        discountId = membershipOption.discountId;
      } else { // Otherwise just make it truthy to be updated when membership is actually selected
        discountId = "apply";
      }
    }
    onDiscount(discountId)
  };
  public render(): JSX.Element {
    const { membershipOptions, invoiceOptionsError, invoiceOptionsLoading, discountId } = this.props;

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
        <FormControlLabel
          control={
            <Checkbox
              name="discount-select"
              value="discount-select"
              checked={!!discountId}
              onChange={this.toggleDiscount}
              color="default"
            />
          }
          label="Apply 10% Discount for all student, senior (+65) and military. Proof of applicable affiliation may be required during orientation."
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
