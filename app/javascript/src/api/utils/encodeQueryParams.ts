import isObject from "lodash-es/isObject";

export const encodeQueryParams = (queryParms: { [key: string]: any }) => {
  if (!queryParms) { return {}; }
  const params = Object.entries(queryParms).reduce((params, [key, param]) => {
    if (param) {
      params[key] = isObject(param) ? JSON.stringify(param) : encodeURIComponent(param);
    }
    return params;
  }, {});
  return params;
}