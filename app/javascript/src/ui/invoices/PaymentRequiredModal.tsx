import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";

import pick from "lodash-es/pick";

import { Invoice } from "app/entities/invoice";
import { CollectionOf } from "app/interfaces";
import { Routing } from "app/constants";

import { ScopedThunkDispatch } from "ui/reducer";
import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";
import Table from "ui/common/table/Table";
import { Column } from "ui/common/table/Table";
import { timeToDate } from "ui/utils/timeToDate";
import { Action as CheckoutAction } from "ui/checkout/constants";


interface OwnProps {
  invoices: CollectionOf<Invoice>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  resetCart?: boolean;
}

interface DispatchProps {
  resetStagedInvoices: () => void;
  stageInvoices: (invoices: CollectionOf<Invoice>) => void;
}

interface Props extends OwnProps, DispatchProps {}

interface State {
  redirect: boolean;
  selectedIds: string[];
}

class PaymentRequiredModal extends React.Component<Props, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;
  private fields: Column<Invoice>[] = [
    {
      id: "description",
      label: "Description",
      cell: (row: Invoice) => row.description,
    },
    {
      id: "dueDate",
      label: "Due Date",
      cell: (row: Invoice) => {
        const textColor = row.pastDue ? "red" : "black"
        return (
          <span style={{ color: textColor }}>
            {timeToDate(row.dueDate)}
          </span>
        )
      },
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: Invoice) => `$${row.amount}`,
    },
  ];

  constructor(props: Props){
    super(props);
    this.state = {
      redirect: false,
      selectedIds: Object.keys(props.invoices)
    };
  }

  public componentDidMount() {
    this.props.resetCart && this.props.resetStagedInvoices();
  }

  public componentDidUpdate(prevProps: Props) {
    const { isOpen: wasOpen } = prevProps;
    const { isOpen } = this.props;

    // Select all invoices on open
    // This modal should be used to preview their 'cart' so should be expected to
    // move all invoices to checkout if no action is taken
    if (!wasOpen && isOpen) {
      this.setState({ selectedIds: Object.keys(this.props.invoices) });
    }
  }

  private onSubmit = () => {
    const { selectedIds } = this.state;
    const { invoices } = this.props;

    const invoicesToPay = pick(invoices, selectedIds);
    this.props.stageInvoices(invoicesToPay);
    this.setState({ redirect: true})
  }

  private onSelectAll = () => {
    this.setState((state) => {
      const { selectedIds } = state;
      const { invoices } = this.props;
      if (selectedIds.length === Object.keys(invoices).length) {
        this.setState({ selectedIds: [] });
      } else {
        this.setState({ selectedIds: Object.keys(invoices)});
      }
    });
  }

  private onSelect = (selectedId: string) => {
    this.setState((state) => {
      const { selectedIds } = state;
      const index = selectedIds.indexOf(selectedId);
      if (index > -1) {
        selectedIds.splice(index, 1);
      } else {
        selectedIds.push(selectedId);
      }
      this.setState({ selectedIds });
    })
  }

  private rowId = (row: Invoice) => row.id;

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, invoices } = this.props;
    const { redirect, selectedIds } = this.state;
    const invoicesList = Object.values(invoices);

    if (redirect) {
      return (
        <Redirect to={Routing.Checkout} />
      );
    }

    return (
      <FormModal
        formRef={this.setFormRef}
        id="payment-required-modal"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title="Review items before continuing"
        onSubmit={this.onSubmit}
        submitText="Proceed to Checkout"
        error={error}
      >
        <Table
          id="payment-invoices-table"
          loading={isRequesting}
          data={invoicesList}
          error={error}
          selectedIds={selectedIds}
          columns={this.fields}
          rowId={this.rowId}
          onSelect={this.onSelect}
          onSelectAll={this.onSelectAll}
        />
      </FormModal>
    )
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps
): DispatchProps => {
  return {
    resetStagedInvoices: () => dispatch({
      type: CheckoutAction.ResetStagedInvoices
    }),
    stageInvoices: (invoices) => dispatch({
      type: CheckoutAction.StageInvoicesForPayment,
      data: invoices
    })
  }
};

export default connect(null, mapDispatchToProps)(PaymentRequiredModal);
