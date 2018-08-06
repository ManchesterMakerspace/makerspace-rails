import * as React from "react";
import {
  Table,
  TableCell,
  Tooltip,
  TableSortLabel,
  Checkbox,
  TableRow,
  TableHead,
  TableBody,
} from '@material-ui/core';
import { SortDirection } from 'ui/common/table/constants';
import LoadingOverlay from "ui/common/LoadingOverlay";

interface OwnProps {
  id: string;
  page: number;
  data: any[];
  columns: any[];
  selectedIds: string[];
  order: SortDirection;
  orderBy: string;
  onSelectAll: () => void;
  onSelect: (id: string, direction: boolean) => void;
  rowId: (row) => string;
  onSort: (property: string) => void;
}
interface Props extends OwnProps {}

class EnhancedTable extends React.Component<Props, {}> {

  private getHeaderRow = () => {
    const { onSelect, onSelectAll, selectedIds, data } = this.props;
    const numSelected = selectedIds && selectedIds.length;
    const rowCount = data.length;

    const checkbox = (
      <TableCell padding="checkbox">
        <Checkbox
          indeterminate={numSelected > 0 && numSelected < rowCount}
          checked={numSelected > 0 && numSelected === rowCount}
          onChange={onSelectAll}
        />
      </TableCell>
    )

    return (
      <TableHead>
        <TableRow>
          {onSelect &&
            checkbox
          }
          {this.getHeaderCells()}
        </TableRow>
      </TableHead>
    )
  }

  private createSortHandler = property => event => {
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
      const { label, id, numeric, sortable, disablePadding } = column;
      return (
        <TableCell
          id={tableId && `${tableId}-${id}`}
          key={`header-${id}`}
          numeric={numeric}
          padding={disablePadding ? 'none' : 'default'}
        >
        {
          sortable ?
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
    })
  }

  private getBodyRows = () => {
    const { 
      id: tableId,
      data,
      rowId,
      selectedIds,
      onSelect
    } = this.props;

    return Array.isArray(data) ? data.map((row) => {
      const id = rowId(row);
      const tableRowId = `${tableId}-${id}`;
      let checked = false;
      let checkbox = null;

      if (onSelect) {
        checked = selectedIds && selectedIds.includes(id);
        const checkHandler = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
          onSelect(id, checked);
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
    } = this.props;

    return (
      <>
        <Table>
          {this.getHeaderRow()}
          <TableBody>
            {this.getBodyRows()}
          </TableBody>
        </Table>
      </>
    );
  }
}

export default EnhancedTable;