import * as React from "react";

import Table, { Column } from "ui/common/table/Table";
import { SortDirection } from "ui/common/table/constants";
import { TablePagination, Toolbar, Typography, TextField } from "@material-ui/core";
import { itemsPerPage } from "app/constants";
import LoadingOverlay from "ui/common/LoadingOverlay";


interface ActionButton {
  label: string;
  onClick: () => void;
}
interface Props<T> {
  id: string;
  columns: Column<T>[];
  data: T[];
  selectedIds: string[];
  pageNum: number;
  orderBy: string;
  order: SortDirection;
  loading: boolean;
  totalItems: number;
  title: string;
  rowId: (row: T) => string;
  onPageChange: (pageNum: number) => void;
  onSearchEnter?: (searchTerm: string) => void;
  onSort?: (columnName: string) => void;
  onSelect?: (rowId: string, selected: boolean) => void;
  onSelectAll?: () => void;
}

class TableContainer<T> extends React.Component<Props<T>, {}> {

  private onPageChange = (_event: React.ChangeEvent<EventTarget>, newPage: number) => {
    this.props.onPageChange(newPage);
  }

  private onSearchEnter = (event: React.KeyboardEvent<EventTarget>) => {
    if (event.key === "Enter") {
      const searchTerm = (event.currentTarget as HTMLInputElement).value;
      this.props.onSearchEnter(searchTerm);
    }
  }


  public render(): JSX.Element {
    const { 
      id, 
      rowId, 
      onSelect, 
      onSelectAll, 
      onSort, 
      columns, 
      title, 
      data, 
      totalItems, 
      loading, 
      selectedIds, 
      pageNum, 
      order, 
      orderBy 
    } = this.props;

    return (
      <div className="table-container-wrapper">
        <Toolbar>
          <Typography variant="title" color="inherit" className="flex">
            {title}
          </Typography>
          { this.onSearchEnter &&
            <TextField
              type="text"
              disabled={loading}
              placeholder="Search..."
              onKeyPress={this.onSearchEnter}
            />
          }
        </Toolbar>
        <div className="table-wrapper">
          {loading &&  <LoadingOverlay formId={id}/>}
          <Table
            id={id}
            page={pageNum}
            columns={columns}
            data={data}
            selectedIds={selectedIds}
            order={order}
            orderBy={orderBy}
            rowId={rowId}
            onSelect={onSelect}
            onSort={onSort}
            onSelectAll={onSelectAll}
          >
          </Table>
          <TablePagination
            component="div"
            count={totalItems || 0}
            rowsPerPage={itemsPerPage}
            page={pageNum}
            backIconButtonProps={{
              'aria-label': 'Previous Page',
            }}
            nextIconButtonProps={{
              'aria-label': 'Next Page',
            }}
            onChangePage={this.onPageChange}
          />
        </div>
      </div>
    );
  }
}

export default TableContainer;