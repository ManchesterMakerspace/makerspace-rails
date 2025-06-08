import * as React from "react";
import { SortDirection } from "../table/constants";

export interface BaseQueryState {
  [key: string]: any;
  pageNum?: number,
  orderBy?: string;
  order?: SortDirection;
}

const defaultInitQuery: BaseQueryState = {
  pageNum: 0,
  orderBy: "",
  order: SortDirection.Asc
};

type SubParams = number | string | boolean;
type Param = SubParams | SubParams[] | ((val: Param) => Param);
interface QueryContextValues {
  params: BaseQueryState;
  sort(by: string, order: SortDirection): void;
  changePage(newPage: number): void;
  setParam(fieldname: string, value: Param | ((currVal: Param) => void), resetPage?: boolean): void;
}

const defaultValues = {
  params: defaultInitQuery,
  sort: () => {},
  changePage: () => {},
  setParam: () => {}
} as QueryContextValues;

const QueryContext = React.createContext(defaultValues);

export const QueryContextConsumer = QueryContext.Consumer;

export const QueryContextProvider: React.FC<{ initialState?: BaseQueryState }> = ({ children, initialState = {} }) => {
  const [params, setParams] = React.useState({
    ...defaultInitQuery,
    ...initialState
  });
  const changePage = React.useCallback((newPage: number) => {
    setParams(curr => ({ ...curr, pageNum: newPage }));
  }, [setParams]);

  const setParam = React.useCallback((fieldname: string, value: Param, resetPage: boolean = true) => {
    setParams(curr => ({
      ...curr,
      [fieldname]: typeof value === "function" ? value(curr[fieldname]) : value,
      pageNum: resetPage ? 0 : curr.pageNum,
    }));
  }, [setParams]);

  const sort = React.useCallback(
    (by: string, order: SortDirection) => {
      setParams(curr => ({
        ...curr,
        order,
        orderBy: by,
        pageNum: 0
      }));
    },
    [setParams]
  );

  const context: QueryContextValues = React.useMemo(() => ({
    params,
    sort,
    changePage,
    setParam
  }), [JSON.stringify(params), setParam, sort, changePage]);

  return (
    <QueryContext.Provider value={context} >
      {children}
    </QueryContext.Provider>
  );
};

export function withQueryContext<Props>(
  WrappedComponent: React.ComponentClass<Props> | React.FunctionComponent<Props>,
  initialState?: BaseQueryState
) {
  return class extends React.Component<Props> {
    render() {
      return (
        <QueryContextProvider initialState={initialState}>
          <WrappedComponent {...this.props} />
        </QueryContextProvider>
      );
    }
  }
}

export function useQueryContext(initialState: BaseQueryState = {}): QueryContextValues {
  const context = React.useContext(QueryContext);
  if (!context.setParam) {
    throw new Error("useQueryContext invoked outside QueryContextProvider");
  }

// Set initial params on mount
  React.useEffect(() => {
    Object.entries(initialState).map(([key, val]) => {
      context.setParam(key, (curr => curr === undefined ? val : curr));
    })
  }, []);

  Object.entries(initialState).forEach(([key, val]) => {
    context.params[key] = context.params[key] === undefined ? val : context.params[key];
  });


  return context;
}