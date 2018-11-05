import * as React from "react";
import TablePagination from "@material-ui/core/TablePagination";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";

import Table, { Column } from "ui/common/table/Table";
import { SortDirection } from "ui/common/table/constants";
import { defaultItemsPerPage } from "ui/constants";

interface Props<T> {
  id: string;
  title?: string;
  columns: Column<T>[];
  data: T[];
  rowId: (row: T) => string;
  selectedIds?: string[];
  pageNum?: number;
  orderBy?: string;
  order?: SortDirection;
  loading?: boolean;
  totalItems?: number;
  error?: string;
  onPageChange?: (pageNum: number) => void;
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
      const searchTerm = (event.target as HTMLInputElement).value;
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
      orderBy,
      onSearchEnter,
      error,
      onPageChange
    } = this.props;

    return (
      <div className="table-container-wrapper">
        <Toolbar>
          {title && <Typography id={`${id}-title`} variant="title" color="inherit" className="flex">
            {title}
          </Typography>}
          { onSearchEnter &&
            <TextField
              id={`${id}-search-input`}
              type="text"
              disabled={loading}
              placeholder="Search..."
              onKeyPress={this.onSearchEnter}
            />
          }
        </Toolbar>
        <div className="table-wrapper">
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
            error={error}
            loading={loading}
          >
          </Table>
          {totalItems > defaultItemsPerPage && onPageChange && <TablePagination
            component="div"
            count={totalItems || 0}
            rowsPerPage={defaultItemsPerPage}
            rowsPerPageOptions={[]}
            page={pageNum}
            backIconButtonProps={{
              'aria-label': 'Previous Page',
            }}
            nextIconButtonProps={{
              'aria-label': 'Next Page',
            }}
            onChangePage={this.onPageChange}
          />}
        </div>
      </div>
    );
  }
}

export default TableContainer;