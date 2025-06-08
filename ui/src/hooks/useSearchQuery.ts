import { LocationDescriptorObject } from "history";
import * as React from "react";
import useReactRouter from "use-react-router";

type SearchParams = {
  [key: string]: string;
}

export const useSearchQuery = (params: SearchParams): SearchParams => {
  const { location: { search } } = useReactRouter();

  return React.useMemo(() =>  {
    const searchParams = new URLSearchParams(search);

    return Object.entries(params).reduce((values, [key, param]) => ({
      ...values,
      [key]: searchParams.get(param)
    }), {})
  }, [params, search]);
}

export const useSetSearchQuery = (pushLocationOverloads?: LocationDescriptorObject<any>): ((params: SearchParams) => void) => {
  const { history, location: { search } } = useReactRouter();

  return React.useCallback((params: SearchParams) => {
    const searchParams = new URLSearchParams(search);

    Object.entries(params).forEach(([key, value]) => {
      value ? searchParams.set(key, value) : searchParams.delete(key);
    })

    history.push({ search: searchParams.toString(), ...pushLocationOverloads });
  }, [history, search, pushLocationOverloads]);
}

