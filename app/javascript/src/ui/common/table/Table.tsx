import * as React from "react";
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import Typography from '@material-ui/core/Typography';

import { SortDirection } from 'ui/common/table/constants';
import ErrorMessage from "ui/common/ErrorMessage";
import LoadingOverlay from "ui/common/LoadingOverlay";

export interface Column<T> {
  id: string;
  label: string;
  cell: (row: T) => JSX.Element | number | string | boolean;
  defaultSortDirection?: SortDirection;
  numeric?: boolean;
  width?: string | number;
}

interface Props<T> {
  id: string;
  page?: number;
  data: T[];
  columns: Column<T>[];
  selectedIds?: string[];
  order?: SortDirection;
  orderBy?: string;
  error?: string | JSX.Element;
  loading?: boolean;
  onSelectAll?: () => void;
  onSelect?: (id: string, direction: boolean) => void;
  rowId: (row: T) => string;
  onSort?: (property: string) => void;
}

class EnhancedTable<T> extends React.Component<Props<T>, {}> {

  private getHeaderRow = () => {
    const { onSelect, onSelectAll, selectedIds, data, id } = this.props;
    const numSelected = selectedIds && selectedIds.length;
    const rowCount = data.length;

    const checkbox = (
      <TableCell padding="checkbox">
        <Checkbox
          id={`${id}-select-all`}
          color="primary"
          indeterminate={numSelected > 0 && numSelected < rowCount}
          checked={numSelected > 0 && numSelected === rowCount}
          onChange={onSelectAll}
          disabled={!Array.isArray(data) || !data.length}
        />
      </TableCell>
    )

    return (
      <TableHead>
        <TableRow>
          {
            //Display checkbox only if selectAll is possible
            onSelectAll && checkbox ||
            onSelect && <TableCell/>
          }
          {this.getHeaderCells()}
        </TableRow>
      </TableHead>
    )
  }

  private createSortHandler = (property: string) => (_event: React.ChangeEvent<EventTarget>) => {
    this.props.onSort(property);
  };

  private getHeaderCells = () => {
    const {
      id: tableId,
      columns,
      order,
      orderBy,
    } = this.props;

    return columns.map((column) => {
      const { label, id, numeric, defaultSortDirection, width } = column;
      return (
        <TableCell
          id={tableId && `${tableId}-${id}-header`}
          key={`${tableId}-${id}-header`}
          style={width && { width }}
        >
        {
          defaultSortDirection ?
            <Tooltip
              title="Sort"
              placement={numeric ? 'bottom-end' : 'bottom-start'}
              enterDelay={300}
            >
              <TableSortLabel
                active={orderBy === id}
                direction={order}
                onClick={this.createSortHandler(id)}
              >
                {label}
              </TableSortLabel>
            </Tooltip>
          : label
        }
      </TableCell>
      )
    });
  }

  private getErrorRow = () => {
    const {
      id: tableId,
      columns,
      error,
      onSelect,
    } = this.props;

    return (
      <TableRow id={`${tableId}-error-row`}>
        <TableCell colSpan={onSelect ? (columns.length + 1) : columns.length}>
          <ErrorMessage error={error}/>
        </TableCell>
      </TableRow>
    )
  }

  private noDataRow = () => {
    const { columns, id: tableId, onSelect } = this.props;
    return (
      <TableRow id={`${tableId}-no-data-row`}>
        <TableCell colSpan={onSelect ? (columns.length + 1) : columns.length}>
          <Typography align="center" variant="body1">No items</Typography>
        </TableCell>
      </TableRow>
    )
  }

  private getBodyRows = () => {
    const {
      id: tableId,
      data,
      rowId,
      selectedIds,
      onSelect,
    } = this.props;

    if (!Array.isArray(data) || !data.length) { return this.noDataRow(); }

    return  data.map((row) => {
      const id = rowId(row);
      const tableRowId = `${tableId}-${id}`;
      let checked = false;
      let checkbox = null;

      if (onSelect) {
        checked = selectedIds && selectedIds.includes(id);
        const checkHandler = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
          onSelect(id, checked);
        }
        checkbox = (
          <TableCell padding="checkbox">
            <Checkbox
              id={`${tableRowId}-select`}
              color="primary"
              checked={checked}
              onChange={checkHandler}
            />
          </TableCell>
        )
      }

      return (
        <TableRow key={tableRowId} id={`${tableRowId}-row`}>
          {checkbox}
          {...this.getBodyCells(row)}
        </TableRow>
      )
    });
  }

  private getBodyCells = (row: T)  => {
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
    const { error, loading, id } = this.props;

    return (
      <>
        {loading && <LoadingOverlay id={`${id}`}/>}
        <Table>
          {this.getHeaderRow()}
          <TableBody>
            {
              !loading && (error ?
                this.getErrorRow()
                : this.getBodyRows())
            }
          </TableBody>
        </Table>
      </>
    );
  }
}

export default EnhancedTable;