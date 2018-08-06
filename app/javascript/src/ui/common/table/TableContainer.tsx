import * as React from "react";

import Table from "ui/common/table/Table";
import { SortDirection } from "ui/common/table/constants";
import { TablePagination, Toolbar, Typography, TextField } from "@material-ui/core";
import { itemsPerPage } from "app/constants";
import LoadingOverlay from "ui/common/LoadingOverlay";

interface OwnProps {
  id: string;
  columns: any[];
  data: any[];
  selectedIds: string[];
  pageNum: number;
  orderBy: string;
  order: SortDirection;
  loading: boolean;
  totalItems: number;
  title: string;
  rowId: (row) => string;
  onSearchEnter: (searchTerm: string) => void;
  onSort: (columnName: string) => void;
  onSelect: (rowId: string, selected: boolean) => void;
  onSelectAll: () => void;
  onPageChange: (pageNum: string) => void;
}

class TableContainer extends React.Component<OwnProps, {}> {  

  private onPageChange = (_event, newPage) => {
    this.props.onPageChange(newPage);
  }

  private onSearchEnter = (event) => {
    if (event.key === "Enter") {
      const searchTerm = event.target.value;
      this.props.onSearchEnter(searchTerm);
    }
  }

  
  public render(): JSX.Element {
    const { id, rowId, onSelect, onSort, onSelectAll, columns, title, data, totalItems, loading, selectedIds, pageNum, order, orderBy } = this.props;
    
    return (
      <>
        <Toolbar>
          <Typography variant="title" color="inherit" className="flex">
            {title}
          </Typography>
          { this.onSearchEnter && 
            <TextField
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
      </>
    );
  }
}

export default TableContainer;