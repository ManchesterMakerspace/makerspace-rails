import chai from "chai";
import { Member } from "makerspace-ts-api-client";
import { Routing } from "app/constants";
import { timeToDate } from "ui/utils/timeToDate"
import { SortDirection } from "ui/common/table/constants";
import { QueryParams } from "app/interfaces";
import { TablePageObject } from "./table";
import { LoginMember } from "./auth";
import utils from "./common";

const membersListTableId = "members-table";
const membersListFields = ["lastname", "expirationTime", "status"];

export const defaultQueryParams = {
  pageNum: ["0"],
  orderBy: [""],
  order: [SortDirection.Asc],
  search: [""],
  currentMembers: ["true"]
} as any as QueryParams;
export class MemberPageObject extends TablePageObject {
  public welcomeModal = {
    id: "#welcome-modal",
  };

  public fieldEvaluator = (member: Partial<Member>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "expirationTime") {
      chai.expect(text).to.eql(timeToDate(member.expirationTime));
    } else if (field === "status") {
      chai.expect(
        ["Active", "Expired", "Non-Member", "Revoked", "Inactive"].some((status => new RegExp(status, 'i').test(text)))
      ).to.be.true;
    } else {
      chai.expect(text.includes(member[field])).to.be.true;
    }
  }

  private memberFormId = "#member-form";
  public memberForm = {
    id: `${this.memberFormId}`,
    firstname: `${this.memberFormId}-firstname`,
    lastname: `${this.memberFormId}-lastname`,
    street: `${this.memberFormId}-street`,
    unit: `${this.memberFormId}-unit`,
    city: `${this.memberFormId}-city`,
    state: `${this.memberFormId}-state`,
    zip: `${this.memberFormId}-postalCode`,
    expiration: `${this.memberFormId}-expirationTime`,
    contract: `${this.memberFormId}-contract`,
    email: `${this.memberFormId}-email`,
    error: `${this.memberFormId}-error`,
    submit: `${this.memberFormId}-submit`,
    cancel: `${this.memberFormId}-cancel`,
    loading: `${this.memberFormId}-loading`,
    notes: `${this.memberFormId}-notes`,
  }

  private memberDetailId = "#member-detail";
  public memberDetail = {
    title: "#detail-view-title",
    loading: "#member-detail-loading",
    email: `${this.memberDetailId}-email`,
    expiration: `${this.memberDetailId}-expiration`,
    status: `${this.memberDetailId}-status`,
    openRenewButton: "#members-list-renew",
    openEditButton: `${this.memberDetailId}-open-edit-modal`,
    openCardButton: `${this.memberDetailId}-open-card-modal`,
    duesTab: "#dues-tab",
    rentalsTab: "#rentals-tab",
    transactionsTab: "#transactions-tab",
    notificationModal: "#notification-modal",
    notificationModalSubmit: "#notification-modal-submit",
    notificationModalCancel: "#notification-modal-cancel",
  }

  public verifyProfileInfo = async (member: LoginMember) => {
    const { firstname, lastname, email, expirationTime } = member;
    chai.expect(await utils.getElementText(this.memberDetail.title)).to.eql(`${firstname} ${lastname}`);
    chai.expect(await utils.getElementText(this.memberDetail.email)).to.eql(email);
    if (expirationTime) {
      chai.expect(await utils.getElementText(this.memberDetail.expiration)).to.eql(expirationTime ? timeToDate(expirationTime) : "N/A");
    }
  }

  public openCardModal = async () => {
    await utils.waitForEnabled(this.memberDetail.openCardButton);
    return utils.clickElement(this.memberDetail.openCardButton);  
  }

  public goToMemberRentals = () =>
    utils.clickElement(this.memberDetail.rentalsTab);

  public goToMemberDues = () =>
    utils.clickElement(this.memberDetail.duesTab);

  public goToMemberTransactions = () =>
    utils.clickElement(this.memberDetail.transactionsTab);

  private cardFormId = "#card-form";
  public accessCardForm = {
    id: `${this.cardFormId}`,
    error: `${this.cardFormId}-error`,
    deactivateButton: `${this.cardFormId}-deactivate`,
    lostButton: `${this.cardFormId}-lost`,
    stolenButton: `${this.cardFormId}-stolen`,
    importButton: `${this.cardFormId}-import-new-key`,
    importConfirmation: `${this.cardFormId}-key-confirmation`,
    idVerification: `${this.cardFormId}-id-verified`,
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