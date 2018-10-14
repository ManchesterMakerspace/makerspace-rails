import { Routing } from "app/constants";

export class MemberPageObject {
  public welcomeModal = {
    id: "#welcome-modal-form-modal",
  };
  public memberForm = {
    id: "#member-form",
    firstname: "#member-form-firstname",
    lastname: "#member-form-lastname",
    email: "#member-form-email",
    error: "#member-form-error",
    submit: "#member-form-submit",
    cancel: "#member-form-cancel",
  }
  public memberDetail = {
    email: "#member-detail-email",
    expiration: "#member-detail-expiration",
    status: "#member-detail-status",
    openRenewButton: "#member-detail-open-renew-modal",
    openEditButton: "#member-detail-open-edit-modal",
    openCardButton: "#member-detail-open-card-modal",
  }
  public renewalForm = {
    id: "#renewal-form",
    entity: "#renwal-form-entity-name",
    renewalSelect: "#renewal-term",
    renewalOption: "#renewal-option-{OPTION}",
    error: "#renewal-form-error",
    submit: "#renewal-form-submit",
    cancel: "#renewal-form-cancel",
  }
  public accessCardForm = {
    id: "#card-form",
    error: "#card-form-error",
    lostButton: "#card-form-lost",
    stolenButton: "#card-form-stolen",
    importButton: "#card-form-import-new-key",
    importConfirmation: "#card-form-key-confirmation",
    submit: "#card-form-submit",
    cancel: "#card-form-cancel",
  }
  public membersList = {
    id: "#members-table",
    createMemberButton: "#members-list-create",
    renewMemberButton: "#members-list-renew",
    searchInput: "#members-table-search-input",
    selectAllCheckbox: "#members-table-select-all",
    headers: {
      lastname: "#members-table-lastname-header",
      expirationTime: "#members-table-expirationTime-header",
      status: "#members-table-status-header",
    },
    row: {
      id: "#members-table-{ID}",
      select: "#members-table-{ID}-select",
      lastname: "#members-table-{ID}-lastname",
      expirationTime: "#members-table-{ID}-expirationTime",
      status: "#members-table-{ID}-status",
    },
    error: "#members-table-error-row",
    noData: "#members-table-no-data-row",
    loading: "#members-table-loading",
  }
  public paymentRequiredForm = {
    id: "#payment-required-modal",
    invoiceList: {
      id: "#payment-invoices-table",
      headers: {
        description: "#payment-invoices-table-description-header",
        dueDate: "#payment-invoices-table-dueDate-header",
        amount: "#payment-invoices-table-amount-header",
      },
      row: {
        id: "#payment-invoices-table-{ID}",
        select: "#payment-invoices-table-{ID}-select",
        description: "#payment-invoices-table-{ID}-description",
        dueDate: "#payment-invoices-table-{ID}-dueDate",
        amount: "#payment-invoices-table-{ID}-amount",
      },
      error: "#payment-invoices-table-error-row",
      noData: "#payment-invoices-table-no-data-row",
      loading: "#payment-invoices-table-loading",
    },
    submit: "#payment-required-modal-submit",
    cancel: "#payment-required-modal-cancel",
  }

  public getProfileUrl = (memberId: string) => Routing.Profile.replace(Routing.PathPlaceholder.MemberId, memberId);
}