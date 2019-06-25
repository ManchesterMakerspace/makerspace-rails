import { LoginMember } from "../../pageObjects/auth";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import signup from "../../pageObjects/signup";
import { Routing } from "app/constants";


export const selfRegisterMember = async (newMember: LoginMember) => {
  await utils.waitForNotVisible(signup.membershipSelectForm.loading);
  await signup.selectMembershipOption("one-month");
  await utils.waitForPageLoad(signup.signupUrl);
  await signup.signUpUser(newMember);

  await utils.waitForPageToMatch(Routing.Profile);
  expect(await utils.isElementDisplayed(memberPO.memberDetail.notificationModal));
  await utils.clickElement(memberPO.memberDetail.notificationModalSubmit);

  await utils.waitForVisible(signup.documentsSigning.codeOfConductSubmit);
  await utils.clickElement(signup.documentsSigning.codeOfConductCheckbox);
  await utils.clickElement(signup.documentsSigning.codeOfConductSubmit);
  await utils.waitForVisible(signup.documentsSigning.memberContractCheckbox);
  await utils.clickElement(signup.documentsSigning.memberContractCheckbox);
  await signup.signContract();
  await utils.clickElement(signup.documentsSigning.memberContractSubmit);
  await utils.waitForNotVisible(signup.documentsSigning.memberContractSubmit);
  await utils.waitForPageToMatch(Routing.Profile);
}