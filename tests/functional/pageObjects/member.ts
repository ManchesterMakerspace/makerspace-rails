import { Routing } from "app/constants";

export class MemberPageObject {
  public welcomeModal = {
    id: "#welcome-modal",
  };
  public memberForm = {
    id: "#member-form",
    firstname: "#member-form-firstname",
    lastname: "#member-form-lastname",
    expiration: "#member-form-expiration",
    email: "#member-form-email",
    error: "#member-form-error",
    submit: "#member-form-submit",
    cancel: "#member-form-cancel",
    loading: "#member-form-loading",
  }
  public memberDetail = {
    title: "#detail-view-title",
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
    loading: "#renewal-form-loading",
  }
  public accessCardForm = {
    id: "#card-form",
    error: "#card-form-error",
    deactivateButton: "#card-form-deactivate",
    lostButton: "#card-form-lost",
    stolenButton: "#card-form-stolen",
    importButton: "#card-form-import-new-key",
    importConfirmation: "#card-form-key-confirmation",
    submit: "#card-form-submit",
    cancel: "#card-form-cancel",
    loading: "#card-form-loading",
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

  public getProfilePath = (memberId: string) => Routing.Profile.replace(Routing.PathPlaceholder.MemberId, memberId);
}

export default new MemberPageObject();