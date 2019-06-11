import * as React from "react";
import * as moment from "moment";
import { connect } from "react-redux";
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import Grid from "@material-ui/core/Grid";

import { Rental, Properties } from "app/entities/rental";
import { QueryParams, CollectionOf } from "app/interfaces";
import { MemberDetails } from "app/entities/member";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { readRentalsAction } from "ui/rentals/actions";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";
import { timeToDate } from "ui/utils/timeToDate";
import { CrudOperation } from "app/constants";
import RentalForm from "ui/rentals/RentalForm";
import UpdateRentalContainer, { UpdateRentalRenderProps } from "ui/rentals/UpdateRentalContainer";
import DeleteRentalModal from "ui/rentals/DeleteRentalModal";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";
import Form from "ui/common/Form";
import { rentalToRenewal } from "ui/rentals/utils";
import { rentalRenewalOptions } from "ui/rentals/constants";
import RenewalForm from "ui/common/RenewalForm";

interface OwnProps extends RouteComponentProps<{}> {
  member?: MemberDetails;
  fields?: Column<Rental>[];
}
interface DispatchProps {
  getRentals: (admin: boolean, queryParams?: QueryParams) => void;
}
interface StateProps {
  rentals: CollectionOf<Rental>;
  totalItems: number;
  isReading: boolean;
  readError: string;
  isCreating: boolean;
  createError: string;
  isUpdating: boolean;
  updateError: string;
  admin: boolean;
}
interface Props extends OwnProps, DispatchProps, StateProps { }
interface State {
  selectedId: string;
  pageNum: number;
  orderBy: string;
  order: SortDirection;
  modalOperation: CrudOperation;
  openRentalForm: boolean;
  openRenewalForm: boolean;
}

class RentalsList extends React.Component<Props, State> {
  private fields: Column<Rental>[] = [
    {
      id: "number",
      label: "Number",
      cell: (row: Rental) => row.number,
      defaultSortDirection: SortDirection.Desc,
    },
    {
      id: "description",
      label: "Description",
      cell: (row: Rental) => row.description,
    },
    {
      id: "expiration",
      label: "Expiration Date",
      cell: (row: Rental) => row.expiration ? timeToDate(row.expiration) : "N/A",
      defaultSortDirection: SortDirection.Desc,
    },
    ...this.props.admin ? [{
      id: "member",
      label: "Member",
      cell: (row: Rental) => <Link to={`/members/${row.memberId}`}>{row.memberName}</Link>,
      defaultSortDirection: SortDirection.Desc,
      width: 200
    }] : [],
    {
      id: "status",
      label: "Status",
      cell: (row: Rental) => {
        const current = moment(row.expiration).valueOf() > Date.now();
        const statusColor = current ? Status.Success : Status.Danger;
        const label = current ? "Active" : "Expired";

        return (
          <StatusLabel label={label} color={statusColor}/>
        );
      },
    }
  ];

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedId: undefined,
      pageNum: 0,
      orderBy: "",
      order: SortDirection.Asc,
      modalOperation: undefined,
      openRentalForm: false,
      openRenewalForm: false,
    };
  }

  private openCreateModal = () => this.openRentalModal(CrudOperation.Create);
  private openUpdateModal = () => this.openRentalModal(CrudOperation.Update);
  private openDeleteModal = () => this.openRentalModal(CrudOperation.Delete);
  private openRentalModal = (operation: CrudOperation) => this.setState({ openRentalForm: true, modalOperation: operation });
  private closeRentalModal = () => { this.setState({ openRentalForm: false }); };
  private openRenewalModal = () => this.setState({ openRenewalForm: true });
  private closeRenewalModal = () => { this.setState({ openRenewalForm: false }); };

  private getActionButtons = () => {
    const { selectedId } = this.state;
    const { admin } = this.props;
    const actionButtons: ActionButton[] = [
      ...admin ? [{
        id: "rentals-list-create",
        variant: "contained",
        color: "primary",
        onClick: this.openCreateModal,
        label: "Create New Rental"
      }, {
        id: "rentals-list-edit",
        variant: "outlined",
        color: "primary",
        disabled: !selectedId,
          onClick: this.openUpdateModal,
        label: "Edit Rental"
      }, {
        id: "rentals-list-renew",
        variant: "outlined",
        color: "primary",
        disabled: !selectedId,
        onClick: this.openRenewalModal,
        label: "Renew Rental"
      }, {
        id: "rentals-list-delete",
        variant: "contained",
        color: "secondary",
        disabled: !selectedId,
          onClick: this.openDeleteModal,
        label: "Delete Rental"
      }] as ActionButton[] : [],
    ];

    return (
      <ButtonRow
        actionButtons={actionButtons}
      />
    )
  }

  private getQueryParams = (): QueryParams => {
    const { pageNum, orderBy, order } = this.state
    return { pageNum, orderBy, order };
  }

  public componentDidMount() {
    this.getRentals();
  }

  public componentDidUpdate(prevProps: Props) {
    const { isCreating: wasCreating, isUpdating: wasUpdating, member: oldMember } = prevProps;
    const { isCreating, createError, isUpdating, updateError, member } = this.props;

    if ((wasCreating && !isCreating && !createError) || // refresh list on create
        (wasUpdating && !isUpdating && !updateError) ||  // or update
        ((oldMember && oldMember.id) !== (member && member.id)) // or member change
    ) {
      this.getRentals(true);
    }
  }

  private getRentals = (resetPage: boolean = false) => {
    const { admin } = this.props;
    if (resetPage) {
      this.setState({ pageNum: 0 });
    }
    this.props.getRentals(admin, this.getQueryParams());
  }
  private rowId = (row: Rental) => row.id;

  private onSort = (prop: string) => {
    const orderBy = prop;
    let order = SortDirection.Desc;
    if (this.state.orderBy === orderBy && this.state.order === order) {
      order = SortDirection.Asc;
    }
    this.setState({ order, orderBy, pageNum: 0 },
      () => this.getRentals(true)
    );
  }

  private onPageChange = (newPage: number) => {
    this.setState({ pageNum: newPage },
      this.getRentals
    );
  }


  // Only select one at a time
  private onSelect = (id: string, selected: boolean) => {
    if (selected) {
      this.setState({ selectedId: id });
    } else {
      this.setState({ selectedId: undefined });
    }
  }

  private renderInvoiceForms = () => {
    const { selectedId, openRentalForm, modalOperation, openRenewalForm } = this.state;
    const { rentals, member, admin } = this.props;

    const editForm = (renderProps: UpdateRentalRenderProps) => (
      <RentalForm
        ref={renderProps.setRef}
        rental={renderProps.rental}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
      />
    );

    const createForm = (renderProps: UpdateRentalRenderProps) => (
      <RentalForm
        ref={renderProps.setRef}
        rental={renderProps.rental}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
        title="Create Rental"
      />
    );

    const renewForm = (renderProps: UpdateRentalRenderProps) => (
      <RenewalForm
        ref={renderProps.setRef}
        renewalOptions={rentalRenewalOptions}
        title="Renew Rental"
        entity={rentalToRenewal(renderProps.rental)}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
      />
    )

    const deleteModal = (renderProps: UpdateRentalRenderProps) => {
      const submit = async (form: Form) => {
        const success = await renderProps.submit(form);
        if (success) {
          this.setState({ selectedId: undefined, pageNum: 0 },
            this.getRentals);
        }
      }
      return (
        <DeleteRentalModal
          ref={renderProps.setRef}
          rental={renderProps.rental}
          isOpen={renderProps.isOpen}
          isRequesting={renderProps.isRequesting}
          error={renderProps.error}
          onClose={renderProps.closeHandler}
          onSubmit={submit}
        />
      );
    }

    const selectedRental = rentals[selectedId];

    return (admin &&
      <>
        {!!selectedRental && (
          <>
            <UpdateRentalContainer
              operation={CrudOperation.Update}
              isOpen={openRentalForm && modalOperation === CrudOperation.Update}
              rental={rentals[selectedId]}
              closeHandler={this.closeRentalModal}
              render={editForm}
            />
            <UpdateRentalContainer
              operation={CrudOperation.Update}
              isOpen={openRenewalForm}
              rental={rentals[selectedId]}
              closeHandler={this.closeRenewalModal}
              render={renewForm}
            />
            <UpdateRentalContainer
              operation={CrudOperation.Delete}
              isOpen={openRentalForm && modalOperation === CrudOperation.Delete}
              rental={rentals[selectedId]}
              closeHandler={this.closeRentalModal}
              render={deleteModal}
            />
          </>
        )}
        <UpdateRentalContainer
          operation={CrudOperation.Create}
          isOpen={openRentalForm && modalOperation === CrudOperation.Create}
          rental={member ? { memberId: member.id, memberName: `${member.firstname} ${member.lastname}` } : {}}
          closeHandler={this.closeRentalModal}
          render={createForm}
        />
      </>
    );
  }


  public render(): JSX.Element {
    const { rentals, totalItems, isReading, readError, admin, member } = this.props;

    const { selectedId, pageNum, order, orderBy } = this.state;

    return (
      <Grid container spacing={24} justify="center">
        <Grid item md={member ? 12 : 10} xs={12}>
          {
            admin && (
              this.getActionButtons()
            )
          }
          <TableContainer
            id="rentals-table"
            title="Rentals"
            loading={isReading}
            data={Object.values(rentals)}
            error={readError}
            totalItems={totalItems}
            selectedIds={[selectedId]}
            pageNum={pageNum}
            columns={this.fields}
            order={order}
            orderBy={orderBy}
            onSort={this.onSort}
            rowId={this.rowId}
            onPageChange={this.onPageChange}
            onSelect={this.onSelect}
          />
          {this.renderInvoiceForms()}
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const {
    entities: rentals,
    read: {
      totalItems,
      isRequesting: isReading,
      error: readError
    },
    create: {
      isRequesting: isCreating,
      error: createError
    },
    update: {
      isRequesting: isUpdating,
      error: updateError
    }
  } = state.rentals;

  const { currentUser: { isAdmin: admin } } = state.auth;
  return {
    rentals,
    totalItems,
    isReading,
    readError,
    isCreating,
    createError,
    isUpdating,
    updateError,
    admin,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps
): DispatchProps => {
  const { member } = ownProps;
  return {
    getRentals: (admin, queryParams) => dispatch(
      readRentalsAction(admin, {
        ...queryParams,
      ...member && { [Properties.MemberId]: member.id},
      })
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RentalsList));