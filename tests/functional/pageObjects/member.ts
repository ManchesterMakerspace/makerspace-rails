import { Routing } from "app/constants";
import utils from "./common";
import { TablePageObject } from "./table";
import { timeToDate } from "ui/utils/timeToDate"
import { MemberDetails } from "app/entities/member";

const membersListTableId = "members-table";
const membersListFields = ["lastname", "expirationTime", "status"];
export class MemberPageObject extends TablePageObject {
  public welcomeModal = {
    id: "#welcome-modal",
  };

  public fieldEvaluator = (member: Partial<MemberDetails>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "expirationTime") {
      expect(text).toEqual(timeToDate(member.expirationTime));
    } else if (field === "status") {
      expect(
        ["Active", "Expired", "Non-Member", "Revoked", "Inactive"].some((status => new RegExp(status, 'i').test(text)))
      ).toBeTruthy();
    } else {
      expect(text.includes(member[field])).toBeTruthy();
    }
  }

  private memberFormId = "#member-form";
  public memberForm = {
    id: `${this.memberFormId}`,
    firstname: `${this.memberFormId}-firstname`,
    lastname: `${this.memberFormId}-lastname`,
    expiration: `${this.memberFormId}-expirationTime`,
    contract: `${this.memberFormId}-contract`,
    email: `${this.memberFormId}-email`,
    error: `${this.memberFormId}-error`,
    submit: `${this.memberFormId}-submit`,
    cancel: `${this.memberFormId}-cancel`,
    loading: `${this.memberFormId}-loading`,
  }

  private memberDetailId = "#member-detail";
  public memberDetail = {
    title: "#detail-view-title",
    email: `${this.memberDetailId}-email`,
    expiration: `${this.memberDetailId}-expiration`,
    status: `${this.memberDetailId}-status`,
    openRenewButton: `${this.memberDetailId}-open-renew-modal`,
    openEditButton: `${this.memberDetailId}-open-edit-modal`,
    openCardButton: `${this.memberDetailId}-open-card-modal`,
    duesTab: "#dues-tab",
    rentalsTab: "#rentals-tab",
    notificationModal: "#notification-modal",
    notificationModalSubmit: "#notification-modal-submit",
    notificationModalCancel: "#notification-modal-cancel",
  }

  public goToMemberRentals = () =>
    utils.clickElement(this.memberDetail.rentalsTab);

  public goToMemberDues = () =>
    utils.clickElement(this.memberDetail.duesTab);

  private cardFormId = "#card-form";
  public accessCardForm = {
    id: `${this.cardFormId}`,
    error: `${this.cardFormId}-error`,
    deactivateButton: `${this.cardFormId}-deactivate`,
    lostButton: `${this.cardFormId}-lost`,
    stolenButton: `${this.cardFormId}-stolen`,
    importButton: `${this.cardFormId}-import-new-key`,
    importConfirmation: `${this.cardFormId}-key-confirmation`,
    submit: `${this.cardFormId}-submit`,
    cancel: `${this.cardFormId}-cancel`,
    loading: `${this.cardFormId}-loading`,
  }

  public membersListUrl = Routing.Members;
  private membersListTableId = "#members-table";
  public membersList = {
    id: this.membersListTableId,
    createMemberButton: "#members-list-create",
    renewMemberButton: "#members-list-renew",
    searchInput: `${this.membersListTableId}-search-input`,
    selectAllCheckbox: `${this.membersListTableId}-select-all`,
    headers: {
      lastname: `${this.membersListTableId}-lastname-header`,
      expirationTime: `${this.membersListTableId}-expirationTime-header`,
      status: `${this.membersListTableId}-status-header`,
    },
    row: {
      id: `${this.membersListTableId}-{ID}`,
      select: `${this.membersListTableId}-{ID}-select`,
      lastname: `${this.membersListTableId}-{ID}-lastname`,
      expirationTime: `${this.membersListTableId}-{ID}-expirationTime`,
      status: `${this.membersListTableId}-{ID}-status`,
    },
    error: `${this.membersListTableId}-error-row`,
    noData: `${this.membersListTableId}-no-data-row`,
    loading: `${this.membersListTableId}-loading`,
  }

  public getProfilePath = (memberId: string) => Routing.Profile.replace(Routing.PathPlaceholder.MemberId, memberId);
}

export default new MemberPageObject(membersListTableId, membersListFields);