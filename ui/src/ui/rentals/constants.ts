import { SelectOption } from "ui/common/RenewalForm";
import { dateToTime } from "ui/utils/timeToDate";
import { Rental } from "makerspace-ts-api-client";

const formPrefix = "rental-form";
export const fields = (rental: Rental) =>  ({
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
    error: "Expiration date required"
  },
  memberId: {
    label: "Select a member",
    name: `${formPrefix}-member`,
    placeholder: `Search by name or email`,
    validate: (val: string) => !!val,
    transform: (val: SelectOption) => val && val.value,
  },
  contractOnFile: {
    label: "Rental Agreement Signed?",
    name: `${formPrefix}-contract`,
    transform: (val: string) => !!val,
  },
  notes: {
    label: "Notes",
    name: `${formPrefix}-notes`,
  }
});
