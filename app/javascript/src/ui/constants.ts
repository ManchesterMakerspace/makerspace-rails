export enum Status {
  Success = "success",
  Danger = "danger",
  Info = "info",
  Warn = "warn",
  Default = "default",
}

export enum ItemsPerPage {
  Five = 5,
  Ten = 10,
  TwentyFive = 26,
}
export const defaultItemsPerPage = ItemsPerPage.TwentyFive;

export const mongoIdRegex = /^[a-f\d]{24}$/i