import { Url } from "url";

export const buildJsonUrl = (path: string) => {
  return `${path}.json`;
}

export const emailValid = (email: string): boolean => {
  return (/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i).test(email);
}