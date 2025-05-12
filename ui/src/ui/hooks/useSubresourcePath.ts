import * as React from "react";
import useReactRouter from "use-react-router";

/**
 * Requires :resource when setting up the route
 * @param options Subpaths
 */
export default function useSubresourcePath(options: string[]) {
  const { match: { params: { resource }}, history, location: { pathname } } = useReactRouter();

  const changeResource = React.useCallback((newActiveName: string) => {
    const newResource = options.find(opt => opt === newActiveName);
    if (newResource && resource !== newResource) {
      const hasSubpath = options.some(opt => pathname.endsWith(`/${opt}`));
      const newPath = hasSubpath ? pathname.replace(/\/[^\/]*$/, `/${newResource}`) : `${pathname}/${newResource}`;
      history.push(newPath);
    }
  }, [options, resource]);

  return changeResource;
}