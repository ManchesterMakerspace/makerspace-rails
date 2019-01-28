import * as moment from "moment";
import auth, { LoginMember } from "../pageObjects/auth";
import utils from "../pageObjects/common";
import header from "../pageObjects/header";
import { MemberDetails } from "app/entities/member";
import { basicUser, adminUser, defaultMembers } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";
import { timeToDate } from "ui/utils/timeToDate"
import memberPo from "../pageObjects/member";
import renewalPO from "../pageObjects/renewalForm";


const verifyFieldsForMember = async (member: Partial<MemberDetails>) => {
  const fields: { field: string, text: string }[] = await Promise.all(memberPo.membersListFields.map((field: string) => {
    return new Promise(async (resolve) => {
      const text = await memberPo.getColumnText(field, member.id);
      resolve({
        field,
        text
      });
    }) as Promise<{ field: string, text: string }>;
  }));

  fields.forEach(fieldObj => {
    const { field, text } = fieldObj;
    if (field === "expirationTime") {
      expect(text).toEqual(timeToDate(member.expirationTime));
    } else if (field === "status") {
      expect(
        ["Active", "Expired", "Non-Member", "Revoked", "Inactive"].some((status => new RegExp(status, 'i').test(text)))
      ).toBeTruthy();
    } else {
      expect(text.includes(member[field])).toBeTruthy();
    }
  });
}
const verifyListView = async (membersList: LoginMember[]) => {
  expect(await utils.isElementDisplayed(memberPo.getErrorRowId())).toBeFalsy();
  expect(await utils.isElementDisplayed(memberPo.getNoDataRowId())).toBeFalsy();
  expect((await memberPo.getAllRows()).length).toEqual(membersList.length);

  await Promise.all(membersList.slice(0, 5).map(async (member) => {
    await verifyFieldsForMember(member);
  }));

  const id = membersList[0].id;
  const columns = memberPo.getColumnIds(["lastname"], id);

  await utils.clickElement(`${columns["lastname"]} a`);
  await utils.waitForPageLoad(memberPo.getProfilePath(id));
}

describe("Members page", () => {
  describe("Basic User", () => {
    beforeEach(() => {
      return auth.autoLogin(basicUser).then(async () => {
        await mock(mockRequests.members.get.ok(defaultMembers));
        await header.navigateTo(header.links.members);
      });
    });
    it("Loads a list of members", async () => {
      await verifyListView(defaultMembers);
    });
    it("Does not have an option to create or renew a new member", async () => {
      expect(await utils.isElementDisplayed(memberPo.membersList.createMemberButton)).toBeFalsy();
      expect(await utils.isElementDisplayed(memberPo.membersList.renewMemberButton)).toBeFalsy();
    });
  });
  fdescribe("Admin User", () => {
    beforeEach(() => {
      return auth.autoLogin(adminUser).then(async () => {
        await mock(mockRequests.members.get.ok(defaultMembers));
        await header.navigateTo(header.links.members);
      });
    });
    it("Loads a list of members", async () => {
      await verifyListView(defaultMembers);
    });
    it("Creating a new member", async () => {
      const newMember = {
        firstname: "New",
        lastname: "Member",
        email: "new_member@mm.com",
        status: basicUser.status,
        groupName: "",
        expirationTime: (basicUser.expirationTime),
        role: basicUser.role,
      }
      const newMemberId = "new_new";

      const updatedMembersList = [
        ...defaultMembers.slice(1, defaultMembers.length),
        newMember
      ]
      await utils.waitForVisisble(memberPo.membersList.createMemberButton);
      await utils.clickElement(memberPo.membersList.createMemberButton);
      await utils.waitForVisisble(memberPo.memberForm.submit);
      await utils.clickElement(memberPo.memberForm.submit);
      await utils.assertInputError(memberPo.memberForm.firstname);
      await utils.assertInputError(memberPo.memberForm.lastname);
      await utils.assertInputError(memberPo.memberForm.expiration);
      await utils.assertInputError(memberPo.memberForm.email);
      await utils.fillInput(memberPo.memberForm.email, "foo");
      await utils.assertNoInputError(memberPo.memberForm.email);
      await utils.fillInput(memberPo.memberForm.firstname, newMember.firstname);
      await utils.assertNoInputError(memberPo.memberForm.firstname);
      await utils.fillInput(memberPo.memberForm.email, "");
      await utils.fillInput(memberPo.memberForm.lastname, newMember.lastname);
      await utils.assertNoInputError(memberPo.memberForm.lastname);
      await utils.inputTime(memberPo.memberForm.expiration, newMember.expirationTime);
      await utils.assertNoInputError(memberPo.memberForm.expiration);

      await utils.clickElement(memberPo.memberForm.submit);
      await utils.assertInputError(memberPo.memberForm.email);
      await utils.fillInput(memberPo.memberForm.email, newMember.email);
      await utils.assertNoInputError(memberPo.memberForm.email);

      await mock(mockRequests.members.post.ok(newMember, newMemberId));
      await mock(mockRequests.members.get.ok(updatedMembersList));

      await utils.clickElement(memberPo.memberForm.submit);
      await utils.waitForNotVisible(memberPo.memberForm.submit);
      await verifyFieldsForMember(newMember);
    });
    it("Renewing a member", async () => {
      const updatedMember: LoginMember = {
        ...defaultMembers[0],
        expirationTime: moment(defaultMembers[0].expirationTime).add(1, 'M').valueOf()
      };

      const updatedMembersList = [
        ...defaultMembers.slice(1, defaultMembers.length),
        updatedMember
      ]
      await memberPo.selectRow(updatedMember.id);
      await utils.waitForVisisble(memberPo.membersList.renewMemberButton);
      await utils.clickElement(memberPo.membersList.renewMemberButton);
      await utils.waitForVisisble(renewalPO.renewalForm.submit);
      expect(await utils.getElementText(renewalPO.renewalForm.entity)).toEqual(`${updatedMember.firstname} ${updatedMember.lastname}`);
      await utils.clickElement(renewalPO.renewalForm.submit);
      await utils.assertInputError(renewalPO.renewalForm.termError, true);
      await utils.selectDropdownByValue(renewalPO.renewalForm.renewalSelect, "1");
      await utils.assertNoInputError(renewalPO.renewalForm.termError, true);

      await mock(mockRequests.member.put.ok(updatedMember.id, updatedMember, true));
      await mock(mockRequests.members.get.ok(updatedMembersList));
      await utils.clickElement(renewalPO.renewalForm.submit);
      await utils.waitForNotVisible(renewalPO.renewalForm.submit);
      await verifyFieldsForMember(updatedMember);
    })
  });
});