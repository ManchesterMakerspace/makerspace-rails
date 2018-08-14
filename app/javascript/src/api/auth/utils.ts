import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";

export const buildEmailCheckPath = (email: string): string => {
  const path = Url.Auth.EmailCheck.replace(Url.PathPlaceholder.Email, email);
  return buildJsonUrl(path);
}