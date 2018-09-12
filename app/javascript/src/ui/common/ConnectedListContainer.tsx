import * as React from "react";
import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { connect } from "react-redux";
import { Grid } from "@material-ui/core";

import { QueryParams, RequestStatus } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";


interface OwnProps<T> {
  getDataAction: (queryParams?: QueryParams) => ThunkAction<Promise<void>, {}, {}, AnyAction>;
  rowId: (row: T) => string;
  columns: Column<T>[];
  dataMap: string[];
  statusMap: string[];
  actionButtons?: ActionButton[];
  loading?: boolean;
}
interface DispatchProps {
  getData: (queryParams?: QueryParams) => void;
}
interface StateProps<T> {
  data: T[];
  isRequesting: boolean;
  error: string;
  totalItems?: number;
}
interface Props<T> extends OwnProps<T>, DispatchProps, StateProps<T> {}
interface State {
  selectedId: string;
  pageNum: number;
  orderBy: string;
  search: string;
  order: SortDirection;
}

export class ListContainer<T> extends React.Component<Props<T>, State> {

  constructor(props: Props<T>) {
    super(props);
    this.state = {
      selectedId: undefined,
      pageNum: 0,
      orderBy: "",
      search: "",
      order: SortDirection.Asc,
    };
  }

  private getQueryParams = (): QueryParams => {
    const { pageNum, orderBy, order, search } = this.state
    return { pageNum, orderBy, order, search };
  }

  public componentDidMount() {
    this.getData();
  }

  public getSelectedData() {
    const { data, rowId } = this.props;
    const { selectedId } = this.state;
    if (Array.isArray(data)) {
      return data.find( d => rowId(d) == selectedId );
    }
  }

  private getData = () => {
    this.props.getData(this.getQueryParams());
  }
  private onSort = (prop: string) => {
    const orderBy = prop;
    let order = SortDirection.Desc;
    if (this.state.orderBy === orderBy && this.state.order === order) {
      order = SortDirection.Asc;
    }
    this.setState({ order, orderBy, pageNum: 0 }, this.getData);
  }
  private onPageChange = (newPage: number) => {
    this.setState({ pageNum: newPage }, this.getData);
  }
  private onSearchEnter = (searchTerm: string) => {
    this.setState({ search: searchTerm, pageNum: 0 }, this.getData);
  }
  // Only select one at a time
  private onSelect = (id: string, selected: boolean) => {
    this.setState({ selectedId: selected ? id : undefined });
  }

  public render(): JSX.Element {
    const {
      data,
      totalItems,
      loading,
      error,
      columns,
      rowId,
      actionButtons,
      isRequesting
    } = this.props;

    const {
      selectedId,
      pageNum,
      order,
      orderBy,
    } = this.state;

    const loadingState = loading || isRequesting;

    return (
      <>
        {actionButtons && <Grid container spacing={24}>
          <Grid item xs={12}>
            <ButtonRow actionButtons={actionButtons} />
          </Grid>
        </Grid>}
        <TableContainer
          id="members-table"
          title="Members"
          loading={loadingState}
          data={data}
          error={error}
          totalItems={totalItems}
          selectedIds={[selectedId]}
          pageNum={pageNum}
          onSearchEnter={this.onSearchEnter}
          columns={columns}
          order={order}
          orderBy={orderBy}
          rowId={rowId}
          onSort={this.onSort}
          onPageChange={this.onPageChange}
          onSelect={this.onSelect}
        />
      </>
    );
  }
}

const mapToObject = (map: string[], object: object) => {
  let result;
  map.forEach((key) => {
    result = object[key];
  })
  return result;
}

interface TableStateStatus extends RequestStatus {
  totalItems: number;
}

function mapStateToProps<T>(
  state: ReduxState,
  ownProps: OwnProps<T>
): StateProps<T> {
  const data = mapToObject(ownProps.dataMap, state);
  const statusState = mapToObject(ownProps.statusMap, state);
  const { 
    totalItems,
    isRequesting,
    error
   } = statusState as TableStateStatus;

  return {
    data,
    totalItems,
    isRequesting,
    error,
  }
}

const mapDispatchToProps = <T extends object>(
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps<T>
): DispatchProps => {
  return {
    getData: (queryParams) => dispatch(ownProps.getDataAction(queryParams)),
  }
}

export default function ConnectedListedContainer<T>() {
  return connect<StateProps<T>, DispatchProps>(
      mapStateToProps, mapDispatchToProps
  )(ListContainer as new(props: Props<T>) => ListContainer<T>);
}