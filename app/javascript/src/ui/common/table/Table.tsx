import * as React from "react";
import {
  Table,
  TablePagination,
  Paper,
  TableCell,
  Tooltip,
  TableSortLabel,
  Checkbox,
  TableRow,
  TableHead,
  TableBody,
} from '@material-ui/core';
import { SortDirection } from 'ui/common/table/constants';

interface OwnProps {
  id: string;
  page: number;
  data: any[];
  columns: any[];
  selectedIds: string[];
  order: SortDirection;
  orderBy: string;
  onSelectAll: () => void;
  onSelectionChange: (id: string, direction: boolean) => void;
  rowId: (row) => string;
  onSort: (event, property: string) => void;
}
interface Props extends OwnProps {}

class EnhancedTable extends React.Component<Props, {}> {

  private getHeaderRow = () => {
    const { onSelectionChange, onSelectAll, selectedIds, data } = this.props;
    const numSelected = selectedIds && selectedIds.length;
    const rowCount = data.length;

    const checkbox = (
      <TableCell padding="checkbox">
        <Checkbox
          indeterminate={numSelected > 0 && numSelected < rowCount}
          checked={numSelected === rowCount}
          onChange={onSelectAll}
        />
      </TableCell>
    )

    return (
      <TableHead>
        <TableRow>
          {onSelectionChange &&
            checkbox
          }
          {this.getHeaderCells()}
        </TableRow>
      </TableHead>
    )
  }

  private createSortHandler = property => event => {
    this.props.onSort(event, property);
  };

  private getHeaderCells = () => {
    const { 
      id: tableId, 
      columns, 
      order, 
      orderBy, 
    } = this.props;

    return columns.map((column) => {
      return (
        <TableCell
          id={tableId && `${tableId}-${column.id}`}
          key={`header-${column.id}`}
          numeric={column.numeric}
          padding={column.disablePadding ? 'none' : 'default'}
        >
        <Tooltip
          title="Sort"
          placement={column.numeric ? 'bottom-end' : 'bottom-start'}
          enterDelay={300}
        >
          <TableSortLabel
            active={orderBy === column.id}
            direction={order}
            onClick={this.createSortHandler(column.id)}
          >
            {column.label}
          </TableSortLabel>
        </Tooltip>
      </TableCell>
      )
    })
  }

  private getBodyRows = () => {
    const { 
      id: tableId,
      data,
      rowId,
      selectedIds,
      onSelectionChange
    } = this.props;

    return Array.isArray(data) ? data.map((row) => {
      const id = rowId(row);
      const tableRowId = `${tableId}-${id}`;
      let checked = false;
      let checkbox = null;

      if (onSelectionChange) {
        checked = selectedIds && selectedIds.includes(id);
        const checkHandler = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
          onSelectionChange(id, checked);
        }
        checkbox = (
          <TableCell padding="checkbox">
            <Checkbox
              id={id}
              checked={checked}
              onChange={checkHandler}
            />
          </TableCell>
        )
      }

      return (
        <TableRow key={tableRowId}>
          {checkbox}
          {...this.getBodyCells(row)}
        </TableRow>
      )
    }): [];
  }

  private getBodyCells = (row) => {
    const {
      columns,
      id: tableId,
      rowId
    } = this.props;
    const tableRowId = rowId(row);

    return columns.map((column) => {
      const columnId = `${tableId}-${tableRowId}-${column.id}`;
      return (
        <TableCell
          id={columnId}
          numeric={column.numeric}
          key={columnId}
        >
          {column.cell(row)}
        </TableCell>
      )
    })
  }

  public render() {
    const {
      id,
      rowId,
      data,
      columns,
      onSelectionChange,
      selectedIds,
      order,
      orderBy,
      onSort,
      page,
    } = this.props;

    return (
      <Paper>
        <div>
          <Table>
            {this.getHeaderRow()}
            <TableBody>
              {this.getBodyRows()}
            </TableBody>
          </Table>
        </div>
        {/* <TablePagination
          component="div"
          count={data.length}
          rowsPerPage={20}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
        /> */}
      </Paper>
    );
  }
}

export default EnhancedTable;