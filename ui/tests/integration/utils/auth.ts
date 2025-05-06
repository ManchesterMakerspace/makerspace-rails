import { LoginMember } from "../../pageObjects/auth";
import utils from "../../pageObjects/common";
import signup from "../../pageObjects/signup";


export const selfRegisterMember = async (newMember: LoginMember) => {
  await utils.waitForNotVisible(signup.membershipSelectForm.loading);
  await signup.selectMembershipOption("one-month", true);
  await utils.waitForPageLoad(signup.signupUrl);
  await signup.signUpUser(newMember);

  await utils.waitForVisible(signup.documentsSigning.codeOfConductCheckbox);
  await utils.clickElement(signup.documentsSigning.codeOfConductCheckbox);
  await utils.waitForVisible(signup.documentsSigning.memberContractCheckbox);
  await utils.clickElement(signup.documentsSigning.memberContractCheckbox);
  await signup.signContract();
  // Go to Membership Select
  await signup.goNext();
  await utils.waitForVisible(signup.signUpControls.cartPreview);
  // Just continue on as user selected one from home page
  await signup.goNext();
}