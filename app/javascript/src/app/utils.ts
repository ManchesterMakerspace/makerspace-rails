const apiPath: string = (process as any).env.API_DOMAIN || '';
let basePath = apiPath;
(window as any).setBasePath = (newPath: string) => basePath = newPath;
(window as any).resetBasePath = () => basePath = apiPath;

export const buildJsonUrl = (pathFragments: string | string[], includeBase: boolean = true) => {
  let path: string = includeBase ? `${basePath}/` : "";
  if (Array.isArray(pathFragments)) {
    path += pathFragments.join("/");
  } else {
    path += pathFragments;
  }
  return `${path}.json`;
};

export const emailValid = (email: string): boolean => {
  return (/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i).test(email);
};

