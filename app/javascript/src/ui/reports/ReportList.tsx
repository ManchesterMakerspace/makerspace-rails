import * as React from "react";
import { connect } from "react-redux";
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import { QueryParams, CollectionOf } from "app/interfaces";
import { MemberDetails } from "app/entities/member";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import ButtonRow from "ui/common/ButtonRow";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import Form from "ui/common/Form";
import { CrudOperation } from "app/constants";
import { EarnedMembership, Report } from "app/entities/earnedMembership";
import { timeToDate } from "ui/utils/timeToDate";
import { ReportForm } from "ui/reports/ReportForm";
import UpdateReportContainer, { UpdateReportRenderProps } from "ui/reports/UpdateReportContainer";
import { readReportsAction } from "ui/reports/actions";
import { readMembershipAction } from "ui/earnedMemberships/actions";
import { readMemberAction } from "ui/member/actions";

interface OwnProps extends RouteComponentProps<{}> {
  member: MemberDetails;
}
interface DispatchProps {
  getReports: (queryParams: QueryParams, admin: boolean) => void;
}
interface StateProps {
  reports: CollectionOf<Report>;
  totalItems: number;
  loading: boolean;
  error: string;
  isCreating: boolean;
  createError: string;
  earnedMembership: EarnedMembership;
  isOwnMembership: boolean;
  isAdmin: boolean;
}
interface Props extends OwnProps, StateProps {
  getReports: (queryParams: QueryParams) => void;
}
interface State {
  selectedId: string;
  pageNum: number;
  orderBy: string;
  search: string;
  order: SortDirection;
  openCreateForm: boolean;
  openDetails: boolean;
}

class ReportList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedId: undefined,
      pageNum: 0,
      orderBy: "",
      search: "",
      order: SortDirection.Asc,
      openCreateForm: false,
      openDetails: false,
    };
  }

  private fields: Column<Report>[] = [
    {
      id: "date",
      label: "Created",
      cell: (row: Report) => timeToDate(row.date),
      defaultSortDirection: SortDirection.Desc
    },
    {
      id: "view",
      label: "",
      cell: (row: Report) => <Button onClick={() => this.openDetails(row.id)}>View Report</Button>
    },
  ];

  private openCreateForm = () =>
    this.setState({ openCreateForm: true });
  private closeCreateForm = () =>
    this.setState({ openCreateForm: false });
  private openDetails = (rowId: string) =>
    this.setState({ openDetails: true, selectedId: rowId });
  private closeDetails = () =>
    this.setState({ openDetails: false, selectedId: undefined });

  private renderMembershipForms = () => {
    const { reports, earnedMembership, member, loading, error } = this.props;
    const { selectedId, openCreateForm, openDetails } = this.state;

    const createForm = (renderProps: UpdateReportRenderProps) => {
      return (<ReportForm
        ref={renderProps.setRef}
        membership={renderProps.membership}
        member={renderProps.membership}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
      />)
    }

    const selectedReport = reports[selectedId];
    return (
      <>
        <UpdateReportContainer
          isOpen={openCreateForm}
          membership={earnedMembership}
          member={member}
          closeHandler={this.closeCreateForm}
          render={createForm}
          operation={CrudOperation.Create}
        />
        <ReportForm
          membership={earnedMembership}
          member={member}
          report={selectedReport}
          isOpen={openDetails}
          isRequesting={loading}
          error={error}
          onClose={this.closeDetails}
          disabled={true}
        />
      </>
    )
  }

  private getActionButtons = () => {
    const { selectedId } = this.state;
    const { earnedMembership } = this.props;

    return (
      <ButtonRow
        actionButtons={[{
          id: "report-list-create",
          variant: "contained",
          color: "primary",
          onClick: this.openCreateForm,
          label: "Submit new Report"
        }]}
      />
    )
  }

  private getQueryParams = (): QueryParams => {
    const {
      pageNum,
      orderBy,
      order,
      search,
    } = this.state
    return {
      pageNum,
      orderBy,
      order,
      search,
    };
  }

  public componentDidMount() {
    this.getReports();
  }

  public componentDidUpdate(prevProps: Props) {
    const { isCreating: wasCreating, member: oldMember } = prevProps;
    const { isCreating, createError, member } = this.props;

    if ((wasCreating && !isCreating && !createError) || // refresh list on create
      ((oldMember && oldMember.id) !== (member && member.id)) // or member change
    ) {
      this.getReports(true);
    }
  }

  private getReports = (resetPage: boolean = false) => {
    if (resetPage) {
      this.setState({ pageNum: 0 });
    }
    this.setState({ selectedId: undefined });
    this.props.getReports(this.getQueryParams());
  }
  private rowId = (row: Report) => row.id;

  private onSort = (prop: string) => {
    const orderBy = prop;
    let order = SortDirection.Desc;
    if (this.state.orderBy === orderBy && this.state.order === order) {
      order = SortDirection.Asc;
    }
    this.setState({ order, orderBy, pageNum: 0 },
      () => this.getReports(true)
    );
  }

  private onPageChange = (newPage: number) => {
    this.setState({ pageNum: newPage },
      this.getReports
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

  public render(): JSX.Element {
    const {
      reports,
      totalItems,
      loading,
      error,
      member,
      isOwnMembership
    } = this.props;

    const {
      selectedId,
      pageNum,
      order,
      orderBy,
    } = this.state;

    return (
      <Grid container spacing={24} justify="center">
        <Grid item md={member ? 12 : 10} xs={12}>
          {isOwnMembership && this.getActionButtons()}
          <TableContainer
            id="membership-reports-table"
            title="Earned Membership Reports"
            loading={loading}
            data={Object.values(reports)}
            error={error}
            totalItems={totalItems}
            pageNum={pageNum}
            columns={this.fields}
            order={order}
            orderBy={orderBy}
            onSort={this.onSort}
            rowId={this.rowId}
            onPageChange={this.onPageChange}
          />
          {this.renderMembershipForms()}
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  ownProps: OwnProps
): StateProps => {
  const {
    entities: reports,
    read: {
      totalItems,
      isRequesting: reportsLoading,
      error: reportsError,
    },
    create: {
      isRequesting: isCreating,
      error: createError,
    },
  } = state.reports;
  const {
    read: {
      isRequesting: membershipLoading,
      error: membershipError,
    }
  } = state.earnedMemberships;
  const loading = membershipLoading || reportsLoading;
  const error = membershipError || reportsError;
  const earnedMembershipId = ownProps.member.earnedMembershipId;
  const earnedMembership = state.earnedMemberships.entities[earnedMembershipId];
  const { currentUser: { id: currentUserId, isAdmin } } = state.auth;
  return {
    reports,
    totalItems,
    loading,
    error,
    isCreating,
    createError,
    earnedMembership,
    isAdmin,
    isOwnMembership: currentUserId === ownProps.member.id,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps
): DispatchProps => {
  return {
    getReports: (queryParams, isAdmin) => dispatch(readReportsAction(ownProps.member.earnedMembershipId, queryParams, isAdmin)),
  }
}

const mergeProps = (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  ownProps: OwnProps,
): Props => {
  return {
    ...stateProps,
    ...ownProps,
    getReports: (queryParams) => dispatchProps.getReports(queryParams, stateProps.isAdmin && !stateProps.isOwnMembership)
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps, mergeProps)(ReportList));