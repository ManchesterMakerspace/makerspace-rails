import { expect } from "chai";
import moment from "moment";
import { LoginMember } from "../../pageObjects/auth";
import utils from "../../pageObjects/common";
import header from "../../pageObjects/header";
import { basicUser, adminUser, defaultMembers } from "../../constants/member";
import memberPo, { defaultQueryParams } from "../../pageObjects/member";
import renewalPO from "../../pageObjects/renewalForm";
import { autoLogin } from "../autoLogin";
import { loadMockserver } from "../mockserver";
import { Member, NewMember } from "makerspace-ts-mock-client";
const mocker = loadMockserver();

const verifyRouting = async (member: LoginMember) => {
  const id = member.id;
  const columns = memberPo.getColumnIds(["lastname"], id);

  mocker.getMember_200({ id }, member);
  await utils.clickElement(`${columns["lastname"]} a`);
  await utils.waitForPageLoad(memberPo.getProfilePath(id));
}

describe("Members page", () => {
  describe("Basic User", () => {
    beforeEach(() => {
      return autoLogin(mocker, basicUser).then(async () => {
        mocker.listMembers_200({}, defaultMembers);
        await header.navigateTo(header.links.members);
      });
    });
    it("Loads a list of members", async () => {
      mocker.listMembers_200({}, defaultMembers, { unlimited: true });
      await memberPo.verifyListView(defaultMembers, memberPo.fieldEvaluator);
      await verifyRouting(defaultMembers[0]);
    });
    it("Does not have an option to create or renew a new member", async () => {
      expect(await utils.isElementDisplayed(memberPo.membersList.createMemberButton)).to.be.false;
      expect(await utils.isElementDisplayed(memberPo.membersList.renewMemberButton)).to.be.false;
    });
  });
  describe("Admin User", () => {
    beforeEach(() => {
      return autoLogin(mocker, adminUser).then(async () => {
        mocker.listMembers_200({}, defaultMembers);
        await header.navigateTo(header.links.members);
        await utils.waitForPageLoad(memberPo.membersListUrl);
      });
    });
    it("Loads a list of members", async () => {
      mocker.listMembers_200({}, defaultMembers, { unlimited: true });
      await memberPo.verifyListView(defaultMembers, memberPo.fieldEvaluator);
      await verifyRouting(defaultMembers[0]);
    });
    it("Creating a new member", async () => {
      const newMemberId = "new_new";
      const newMember: NewMember = {
        firstname: "New",
        lastname: "Member",
        email: "new_member@mm.com",
        phone: "",
      };
      const resultingMember: Member = {
        ...newMember,
        expirationTime: (basicUser.expirationTime),
        memberContractOnFile: true,
        role: basicUser.role,
        status: basicUser.status,
        id: newMemberId,
        subscription: false
      }

      const updatedMembersList: Member[] = [
        ...defaultMembers.slice(1, defaultMembers.length),
        resultingMember
      ]
      await utils.waitForVisible(memberPo.membersList.createMemberButton);
      await utils.clickElement(memberPo.membersList.createMemberButton);
      await utils.waitForVisible(memberPo.memberForm.submit);
      await utils.clickElement(memberPo.memberForm.submit);
      await utils.assertInputError(memberPo.memberForm.firstname);
      await utils.assertInputError(memberPo.memberForm.lastname);
      await utils.assertInputError(memberPo.memberForm.email);
      await utils.clickElement(memberPo.memberForm.contract);
      await utils.assertNoInputError(memberPo.memberForm.contract);
      await utils.fillInput(memberPo.memberForm.notes, "some random notes for this member");
      await utils.fillInput(memberPo.memberForm.email, "foo");
      await utils.clickElement(memberPo.memberForm.submit);
      await utils.assertInputError(memberPo.memberForm.email);
      await utils.fillInput(memberPo.memberForm.firstname, newMember.firstname);
      await utils.assertNoInputError(memberPo.memberForm.firstname);
      await utils.fillInput(memberPo.memberForm.email, "");
      await utils.fillInput(memberPo.memberForm.lastname, newMember.lastname);
      await utils.assertNoInputError(memberPo.memberForm.lastname);

      await utils.clickElement(memberPo.memberForm.submit);
      await utils.assertInputError(memberPo.memberForm.email);
      await utils.fillInput(memberPo.memberForm.email, newMember.email);
      await utils.assertNoInputError(memberPo.memberForm.email);

      mocker.adminCreateMember_200({ body: newMember }, resultingMember);
      mocker.listMembers_200({}, updatedMembersList);

      await utils.clickElement(memberPo.memberForm.submit);
      await utils.waitForNotVisible(memberPo.memberForm.submit);
      await memberPo.verifyFields(resultingMember, memberPo.fieldEvaluator);
    });

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
      expect(await utils.getElementText(renewalPO.renewalForm.entity)).to.eql(`${updatedMember.firstname} ${updatedMember.lastname}`);
      await utils.clickElement(renewalPO.renewalForm.submit);
      await utils.assertInputError(renewalPO.renewalForm.termError, true);
      await utils.selectDropdownByValue(renewalPO.renewalForm.renewalSelect, "1");
      await utils.assertNoInputError(renewalPO.renewalForm.termError, true);

      mocker.adminUpdateMember_200({ id: updatedMember.id , body: { renew: 1 } }, updatedMember);
      mocker.listMembers_200({}, updatedMembersList);
      await utils.clickElement(renewalPO.renewalForm.submit);
      await utils.waitForNotVisible(renewalPO.renewalForm.submit);
      await memberPo.verifyFields((updatedMember as any), memberPo.fieldEvaluator);
    })
  });
});