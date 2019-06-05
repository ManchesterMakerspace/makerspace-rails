import * as React from "react";
import { connect } from "react-redux";
import isUndefined from "lodash-es/isUndefined";

import { CollectionOf } from "app/interfaces";
import { InvoiceOption, InvoiceableResource } from "app/entities/invoice";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import ErrorMessage from "ui/common/ErrorMessage";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { Button, FormControlLabel, Checkbox } from "@material-ui/core";
import { readOptionsAction } from "ui/billing/actions";
import { Action as InvoiceOptionAction } from "ui/billing/constants";

interface OwnProps {
  title?: string;
  onSelect?: (membershipOptionId: string, discountId: string) => void;
  subscriptionOnly?: boolean;
}
interface DispatchProps {
  getMembershipOptions: () => void;
  selectMembershipOption: (membershipOptionId: string, discountId: string) => void;
}
interface StateProps {
  membershipOptions: CollectionOf<InvoiceOption>;
  invoiceOptionsLoading: boolean;
  invoiceOptionsError: string;
  createInvoiceError: string;
  membershipOptionId: string;
  discountId: string;
}

interface Props extends OwnProps, DispatchProps, StateProps { }

class MembershipSelectComponent extends React.Component<Props> {

  private selectMembershipOption = (event: React.MouseEvent<HTMLTableElement>) => {
    const { discountId } = this.props;
    const optionId = event.currentTarget.id;
    const option = this.getOption(optionId);
    let optionDiscount;
    if (discountId) { // Only want to update discount if already selected
      optionDiscount = option.discountId;
    }
    this.props.selectMembershipOption(optionId, optionDiscount);
    this.props.onSelect && this.props.onSelect(optionId, optionDiscount);
  };

  private getOption = (id: string) => this.props.membershipOptions[id];

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
    const { membershipOptionId, membershipOptions, selectMembershipOption } = this.props;
    let discountId;
    if (checked) { // Apply discount
      if (membershipOptionId) { // If option is already selected, find related discount and apply
        const membershipOption = membershipOptions[membershipOptionId];
        discountId = membershipOption.discountId;
      } else { // Otherwise just make it truthy to be updated when membership is actually selected
        discountId = "apply";
      }
    }
    selectMembershipOption(membershipOptionId, discountId);
  };

  private byAmount = (a: InvoiceOption, b: InvoiceOption) =>  a.amount - b.amount;

  public render(): JSX.Element {
    const {
      membershipOptions,
      invoiceOptionsError,
      createInvoiceError,
      invoiceOptionsLoading,
      discountId
    } = this.props;

    let normalizedError: JSX.Element =
      (invoiceOptionsError && (
        <>
          Error reading membership options: {invoiceOptionsError}. Email{" "}
          <a href={`mailto: contact@manchestermakerspace.org`}>contact@manchestermakerspace.org</a> if your desired
          membership option is not present
        </>
      )) ||
      (createInvoiceError && <>{createInvoiceError}</>);
    return (
      <>
        <TableContainer
          id="membership-select-table"
          title={isUndefined(this.props.title) && "Select a Membership"}
          data={Object.values(membershipOptions).sort(this.byAmount)}
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
    selectedOption,
    read: {
      isRequesting: invoiceOptionsLoading,
      error: invoiceOptionsError,
    }
  } = state.billing;

  const createInvoiceError = state.invoices.create.error;

  const discountId = selectedOption && selectedOption.discountId;
  const membershipOptionId = selectedOption && selectedOption.invoiceOptionId;

  return {
    membershipOptions,
    invoiceOptionsLoading,
    invoiceOptionsError,
    createInvoiceError,
    membershipOptionId,
    discountId,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps,
): DispatchProps => {
  const { subscriptionOnly } = ownProps;
  return {
    getMembershipOptions: () => dispatch(readOptionsAction({ subscriptionOnly, types: [InvoiceableResource.Membership] })),
    selectMembershipOption: (membershipOptionId, discountId) => dispatch({
      type: InvoiceOptionAction.SelectOption,
      data: { invoiceOptionId: membershipOptionId, discountId }
    })
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(MembershipSelectComponent);
