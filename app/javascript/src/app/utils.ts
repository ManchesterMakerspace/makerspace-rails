const basePath = (process as any).env.API_DOMAIN || '';
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

