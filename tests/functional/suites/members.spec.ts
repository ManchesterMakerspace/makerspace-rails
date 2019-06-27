import * as moment from "moment";
import auth, { LoginMember } from "../pageObjects/auth";
import utils from "../pageObjects/common";
import header from "../pageObjects/header";
import { basicUser, adminUser, defaultMembers } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";
import memberPo from "../pageObjects/member";
import renewalPO from "../pageObjects/renewalForm";

const verifyRouting = async (member: LoginMember) => {
  const id = member.id;
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
      await memberPo.verifyListView(defaultMembers, memberPo.fieldEvaluator);
      await verifyRouting(defaultMembers[0]);
    });
    it("Does not have an option to create or renew a new member", async () => {
      expect(await utils.isElementDisplayed(memberPo.membersList.createMemberButton)).toBeFalsy();
      expect(await utils.isElementDisplayed(memberPo.membersList.renewMemberButton)).toBeFalsy();
    });
  });
  describe("Admin User", () => {
    beforeEach(() => {
      return auth.autoLogin(adminUser).then(async () => {
        await mock(mockRequests.members.get.ok(defaultMembers));
        await header.navigateTo(header.links.members);
        await utils.waitForPageLoad(memberPo.membersListUrl);
      });
    });
    it("Loads a list of members", async () => {
      await memberPo.verifyListView(defaultMembers, memberPo.fieldEvaluator);
      await verifyRouting(defaultMembers[0]);
    });
    it("Creating a new member", async () => {
      const newMemberId = "new_new";
      const newMember = {
        firstname: "New",
        lastname: "Member",
        email: "new_member@mm.com",
        status: basicUser.status,
        groupName: "",
        expirationTime: (basicUser.expirationTime),
        role: basicUser.role,
        id: newMemberId,
      }

      const updatedMembersList = [
        ...defaultMembers.slice(1, defaultMembers.length),
        newMember
      ]
      await utils.waitForVisible(memberPo.membersList.createMemberButton);
      await utils.clickElement(memberPo.membersList.createMemberButton);
      await utils.waitForVisible(memberPo.memberForm.submit);
      await utils.clickElement(memberPo.memberForm.submit);
      await utils.assertInputError(memberPo.memberForm.firstname);
      await utils.assertInputError(memberPo.memberForm.lastname);
      await utils.assertInputError(memberPo.memberForm.email);
      await utils.assertInputError(memberPo.memberForm.contract);
      await utils.clickElement(memberPo.memberForm.contract);
      await utils.assertNoInputError(memberPo.memberForm.contract);
      await utils.fillInput(memberPo.memberForm.email, "foo");
      await utils.assertNoInputError(memberPo.memberForm.email);
      await utils.fillInput(memberPo.memberForm.firstname, newMember.firstname);
      await utils.assertNoInputError(memberPo.memberForm.firstname);
      await utils.fillInput(memberPo.memberForm.email, "");
      await utils.fillInput(memberPo.memberForm.lastname, newMember.lastname);
      await utils.assertNoInputError(memberPo.memberForm.lastname);

      await utils.clickElement(memberPo.memberForm.submit);
      await utils.assertInputError(memberPo.memberForm.email);
      await utils.fillInput(memberPo.memberForm.email, newMember.email);
      await utils.assertNoInputError(memberPo.memberForm.email);

      await mock(mockRequests.members.post.ok(newMember, newMemberId));
      await mock(mockRequests.members.get.ok(updatedMembersList));

      await utils.clickElement(memberPo.memberForm.submit);
      await utils.waitForNotVisible(memberPo.memberForm.submit);
      await memberPo.verifyFields(newMember, memberPo.fieldEvaluator);
    }, 200000);
    it("Renewing a member", async () => {
      const updatedMember: LoginMember = {
        id: "updated_updated",
        ...defaultMembers[0],
        expirationTime: moment(defaultMembers[0].expirationTime).add(1, 'M').valueOf()
      };

      const updatedMembersList = [
        ...defaultMembers.slice(1, defaultMembers.length),
        updatedMember
      ]
      await memberPo.selectRow(updatedMember.id);
      await utils.waitForVisible(memberPo.membersList.renewMemberButton);
      await utils.clickElement(memberPo.membersList.renewMemberButton);
      await utils.waitForVisible(renewalPO.renewalForm.submit);
      expect(await utils.getElementText(renewalPO.renewalForm.entity)).toEqual(`${updatedMember.firstname} ${updatedMember.lastname}`);
      await utils.clickElement(renewalPO.renewalForm.submit);
      await utils.assertInputError(renewalPO.renewalForm.termError, true);
      await utils.selectDropdownByValue(renewalPO.renewalForm.renewalSelect, "1");
      await utils.assertNoInputError(renewalPO.renewalForm.termError, true);

      await mock(mockRequests.member.put.ok(updatedMember.id, updatedMember, true));
      await mock(mockRequests.members.get.ok(updatedMembersList));
      await utils.clickElement(renewalPO.renewalForm.submit);
      await utils.waitForNotVisible(renewalPO.renewalForm.submit);
      await memberPo.verifyFields((updatedMember as any), memberPo.fieldEvaluator);
    })
  });
});