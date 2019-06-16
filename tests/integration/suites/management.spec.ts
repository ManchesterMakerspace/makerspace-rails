import * as moment from "moment";
import auth, { LoginMember } from "../../pageObjects/auth";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import { basicMembers } from "../../constants/member";
import signup from "../../pageObjects/signup";
import header from "../../pageObjects/header";
import memberPo from "../../pageObjects/member";
import renewalPO from "../../pageObjects/renewalForm";
import { Routing } from "app/constants";
import { getAdminUserLogin, createRejectCard } from "../../constants/api_seed_data";
import { selfRegisterMember } from "../utils/auth";

describe("Member management", () => {
  describe("Registering", () => {
    beforeEach(() => {
      return browser.get(utils.buildUrl());
    })
    test("Customers can register from home page", async () => {
      const newMember = Object.assign({}, basicMembers.pop());
      await selfRegisterMember(newMember);
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: null
      });
    });
  
    test("Admins can register a customer manually", async () => {
      const newMember = Object.assign({}, basicMembers.pop());
      const cardId = "1819234";

      await auth.goToLogin();
      await auth.signInUser(getAdminUserLogin());
      await header.navigateTo(header.links.members);
      await utils.waitForPageLoad(memberPo.membersListUrl);
      await utils.waitForVisible(memberPo.membersList.createMemberButton);
      await utils.clickElement(memberPo.membersList.createMemberButton);
      await utils.waitForVisible(memberPo.memberForm.submit);
      await utils.clickElement(memberPo.memberForm.contract);
      await utils.fillInput(memberPo.memberForm.firstname, newMember.firstname);
      await utils.fillInput(memberPo.memberForm.lastname, newMember.lastname);
      await utils.fillInput(memberPo.memberForm.email, newMember.email);
      await utils.clickElement(memberPo.memberForm.submit);
      await utils.waitForNotVisible(memberPo.memberForm.submit);
      await utils.waitForPageToMatch(Routing.Profile);
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: null
      });
       // Renew them for a month
       await utils.clickElement(memberPO.memberDetail.openRenewButton);
       await utils.waitForVisible(renewalPO.renewalForm.submit);
       expect(await utils.getElementText(renewalPO.renewalForm.entity)).toEqual(`${newMember.firstname} ${newMember.lastname}`);
       await utils.selectDropdownByValue(renewalPO.renewalForm.renewalSelect, "1");
       await utils.assertNoInputError(renewalPO.renewalForm.termError, true);
       await utils.clickElement(renewalPO.renewalForm.submit);
       await utils.waitForNotVisible(renewalPO.renewalForm.submit);
      // Get them a fob
      expect(await utils.getElementText(memberPO.memberDetail.openCardButton)).toMatch(/Register Fob/i);
      await utils.clickElement(memberPO.memberDetail.openCardButton);
      await utils.waitForVisible(memberPO.accessCardForm.submit);
      await createRejectCard(cardId);
      await utils.clickElement(memberPO.accessCardForm.importButton);
      await utils.waitForNotVisible(memberPO.accessCardForm.loading);
      expect(await utils.getElementText(memberPO.accessCardForm.importConfirmation)).toEqual(cardId);
      await utils.clickElement(memberPO.accessCardForm.submit);
      expect(await utils.isElementDisplayed(memberPo.accessCardForm.error)).toBeFalsy();
      await utils.waitForNotVisible(memberPO.accessCardForm.submit);
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: moment().add(1, 'M').valueOf()
      });
    });
  });
});
