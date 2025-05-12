import { expect } from "chai";
import { Member, Rental } from "makerspace-ts-api-client";
import { Routing } from "app/constants";
import { timeToDate } from "ui/utils/timeToDate";
import { TablePageObject } from "./table";

const tableId = "rentals-table";
// Member removed as thats only for admins
const rentalsListFields = ["number", "description", "expiration", "status"];

class RentalsPageObject extends TablePageObject {
  public listUrl = Routing.Rentals

  public fieldEvaluator = (member?: Partial<Member>) => (rental: Partial<Rental>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "expiration") {
      expect(text).to.eql(rental.expiration ? timeToDate(rental.expiration) : "N/A");
    } else if (field === "status") {
      expect(
        ["Active", "Expired"].some((status => new RegExp(status, 'i').test(text)))
      ).to.be.true;
    } else if (field === "member") {
      if (member) {
        expect(text).to.eql(`${member.firstname} ${member.lastname}`);
      } else {
        expect(!!text).to.be.true;
      }
    } else {
      expect(text.includes(rental[field])).to.be.true;
    }
  }

  public actionButtons = {
    create: "#rentals-list-create",
    edit: "#rentals-list-edit",
    delete: "#rentals-list-delete",
    renew: "#rentals-list-renew",
  }

  private rentalFormId = "#rental-form";
  public rentalForm = {
    id: `${this.rentalFormId}`,
    description: `${this.rentalFormId}-description`,
    number: `${this.rentalFormId}-number`,
    expiration: `${this.rentalFormId}-expiration`,
    member: `${this.rentalFormId}-member`,
    contract: `${this.rentalFormId}-contract`,
    submit: `${this.rentalFormId}-submit`,
    cancel: `${this.rentalFormId}-cancel`,
    error: `${this.rentalFormId}-error`,
    loading: `${this.rentalFormId}-loading`,
    notes: `${this.rentalFormId}-notes`,
  }


  private deleteRentalModalId = "#delete-rental";
  public deleteRentalModal = {
    id: `${this.deleteRentalModalId}`,
    number: `${this.deleteRentalModalId}-number`,
    description: `${this.deleteRentalModalId}-description`,
    member: `${this.deleteRentalModalId}-member`,
    submit: `${this.deleteRentalModalId}-submit`,
    cancel: `${this.deleteRentalModalId}-cancel`,
    error: `${this.deleteRentalModalId}-error`,
    loading: `${this.deleteRentalModalId}-loading`,
  }

  public rentalsList = {
    createButton: "#rentals-list-create",
    editButton: "#rentals-list-edit",
    renewButton: "#rentals-list-renew",
    deleteButton: "#rentals-list-delete",
  }
}

export default new RentalsPageObject(tableId, rentalsListFields);