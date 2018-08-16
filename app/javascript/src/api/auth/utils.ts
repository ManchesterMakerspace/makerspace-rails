import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";

export const buildEmailCheckPath = (): string => {
  return buildJsonUrl(Url.Auth.EmailCheck);
}