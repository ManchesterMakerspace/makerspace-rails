import { TablePageObject } from "./table";
import { Routing } from "app/constants";
import utils from "./common";

const tableId = "rentals-table";
class RentalsPageObject extends TablePageObject {
  public listUrl = Routing.Rentals

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
    submit: `${this.rentalFormId}-submit`,
    cancel: `${this.rentalFormId}-cancel`,
    error: `${this.rentalFormId}-error`,
    loading: `${this.rentalFormId}-loading`,
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

  public rentalsListFields = ["number", "description", "member", "expiration", "status"];
  public rentalsList = {
    createButton: "#rentals-list-create",
    editButton: "#rentals-list-edit",
    renewButton: "#rentals-list-renew",
    deleteButton: "#rentals-list-delete",
  }
}

export default new RentalsPageObject(tableId);