import { SelectOption } from "ui/common/RenewalForm";
import { dateToTime } from "ui/utils/timeToDate";
import { MemberDetails } from "app/entities/member";

export enum Action {
  StartReadRequest = "RENTALS/START_READ_REQUEST",
  GetRentalsSuccess = "RENTALS/GET_RENTALS_SUCCESS",
  GetRentalsFailure = "RENTALS/GET_RENTALS_FAILURE",

  StartCreateRequest = "RENTALS/START_CREATE_REQUEST",
  CreateRentalSuccess = "RENTALS/CREATE_RENTAL_SUCCESS",
  CreateRentalFailure = "RENTALS/CREATE_RENTAL_FAILURE",

  StartUpdateRequest = "RENTAL/START_UPDATE_REQUEST",
  UpdateRentalSuccess = "RENTAL/UPDATE_RENTAL_SUCCESS",
  UpdateRentalFailure = "RENTAL/UPDATE_RENTAL_FAILURE",

  StartDeleteRequest = "RENTAL/START_DELETE_REQUEST",
  DeleteRentalSuccess = "RENTAL/DELETE_RENTAL_SUCCESS",
  DeleteRentalFailure = "RENTAL/DELETE_RENTAL_FAILURE",
}

export const rentalRenewalOptions: SelectOption[] = [
  {
    label: "None",
    value: undefined,
  },
  {
    label: "1 month",
    value: 1,
  },
  {
    label: "3 months",
    value: 3,
  },
  {
    label: "6 months",
    value: 6,
  },
  {
    label: "12 months",
    value: 12,
  },
]

const formPrefix = "rental-form";
export const fields = {
  number: {
    label: "Number",
    name: `${formPrefix}-number`,
    placeholder: "Enter number",
    validate: (val: string) => !!val,
    error: "Please enter a number",
  },
  description: {
    label: "Description",
    name: `${formPrefix}-description`,
    placeholder: "Enter description",
    validate: (val: string) => true,
    error: "Please enter a description. Often cost of rental",
  },
  expiration: {
    label: "Expiration",
    name: `${formPrefix}-expiration`,
    placeholder: "Select an expiration date",
    transform: (val: string) => dateToTime(val),
    validate: (val: string) => !!val,
    error: "Expiration date required"
  },
  memberId: {
    label: "Select a member",
    name: `${formPrefix}-member`,
    placeholder: `Search by name or email`,
    transform: (val: MemberDetails) => val && val.id,
  },
}