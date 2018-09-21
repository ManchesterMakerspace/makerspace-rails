import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";

import pick from "lodash-es/pick";

import { Invoice, Properties } from "app/entities/invoice";
import { MemberDetails } from "app/entities/member";
import { CollectionOf } from "app/interfaces";
import { Routing } from "app/constants";

import { ScopedThunkDispatch } from "ui/reducer";
import FormModal from "ui/common/FormModal";
import { fields } from "ui/member/constants";
import Form from "ui/common/Form";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { timeToDate } from "ui/utils/timeToDate";
import { Action as CheckoutAction } from "ui/checkout/constants";


interface OwnProps {
  invoices: CollectionOf<Invoice>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
}

interface DispatchProps {
  resetStagedInvoices: () => void;
  stageInvoices: (invoices: CollectionOf<Invoice>) => void;
}

interface Props extends OwnProps, DispatchProps {}

interface State {
  submitText: string;
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
      submitText: "Continue", 
      redirect: false,
      selectedIds: Object.keys(props.invoices)
    };
  }

  public validate = async (_form: Form): Promise<MemberDetails> => (
    this.formRef.simpleValidate<MemberDetails>(fields)
  );

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

    // Pay Now directs to the checkout flow
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
        title="Payment Required"
        onSubmit={this.onSubmit}
        submitText="Pay Now"
        error={error}
      >
        <TableContainer
          id="payment-invoices-table"
          title="Dues"
          loading={isRequesting}
          data={invoicesList}
          error={error}
          totalItems={invoicesList.length}
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
