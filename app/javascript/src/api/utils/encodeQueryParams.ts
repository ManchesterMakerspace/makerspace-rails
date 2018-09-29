import { QueryParams } from "app/interfaces";

export const encodeQueryParams = (queryParms: { [key: string]: any }) => {
  const params = Object.entries(queryParms).reduce((params, [key, param]) => {
    if (param) {
      params[key] = encodeURIComponent(param);
    }
    return params;
  }, {});
  console.log(params);
  return params;
}