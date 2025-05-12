import * as React from "react";
import TableContainer from "./TableContainer";
import { SortDirection } from "./constants";
import { Column } from "./Table";
import { useQueryContext } from "../Filters/QueryContext";

interface Props<Ids, Resp> {
  id: string;
  loading: boolean;
  data: Resp[];
  error: string;
  rowId(row: Resp): string;
  columns: Column<Resp>[];
  title?: string;
  renderSearch?: boolean;
  totalItems?: number;
  selectedIds: Ids;
  setSelectedIds: (ids: Ids) => void;
}

const StatefulTable: React.FC<Props<unknown, unknown>> = ({
  id,
  title,
  loading,
  data = [],
  error,
  rowId,
  columns,
  renderSearch,
  selectedIds,
  setSelectedIds,
  totalItems,
}) => {

  const {
    params: { order, orderBy, pageNum },
    sort,
    changePage,
    setParam,
  } = useQueryContext();

  const search = React.useCallback((val: string) => {
    setParam("search", val);
  }, [setParam]);

  const onSort = React.useCallback((newOrderBy: string) => {
    let newOrder = SortDirection.Desc;
    if (orderBy === newOrderBy && order === newOrder) {
      newOrder = SortDirection.Asc;
    }
    sort(newOrderBy, newOrder);
  }, [pageNum, sort, orderBy, order]);

  const onPageChange = React.useCallback((newPage: number) => changePage(newPage), [changePage]);
  const onSelect = React.useCallback(
    (id: string, selected: boolean) => {
      if (Array.isArray(selectedIds)) {
        const updatedIds = selectedIds.slice();
        const existingIndex = selectedIds.indexOf(id);
        const alreadySelected = existingIndex > -1;
        if (selected && alreadySelected) {
          return;
        } else if (alreadySelected) {
          updatedIds.splice(existingIndex, 1)
        } else {
          updatedIds.push(id)
        }
        return setSelectedIds(updatedIds.filter(id => id !== undefined));
      } else {
        return setSelectedIds(selected ? id : undefined);
      }
  },
    [setSelectedIds, selectedIds]
  );

  // SelectAll only works with lists of IDs
  const onSelectAll = React.useCallback(() => {
    if (Array.isArray(selectedIds)) {
      const allIds = data.map(rowId);
      if (selectedIds.length === allIds.length) {
        setSelectedIds([]);
      } else {
        setSelectedIds(allIds);
      }
    }
  }, [setSelectedIds, data]);

  return (
    <TableContainer
      id={id}
      title={title}
      loading={loading}
      data={data}
      error={error}
      totalItems={totalItems}
      selectedIds={Array.isArray(selectedIds) ? selectedIds : [selectedIds]}
      pageNum={pageNum}
      columns={columns}
      order={order}
      orderBy={orderBy}
      onSort={onSort}
      rowId={rowId}
      onPageChange={onPageChange}
      onSelect={setSelectedIds && onSelect}
      onSelectAll={Array.isArray(selectedIds) && setSelectedIds && onSelectAll}
      onSearchEnter={renderSearch && search}
    />
  )
}

export default function<Args, Resp>(props: Props<Args, Resp>): React.ReactElement<Props<Args, Resp>> {
  return <StatefulTable {...props} />
}