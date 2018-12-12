

import { Routing } from "app/constants";
import { MemberDetails } from "app/entities/member";
import { PageUtils, rootURL } from "./common";
import { mock, mockRequests } from "../mockserver-client-helpers";
import { MemberPageObject } from "../pageObjects/member";

const utils = new PageUtils();
const memberPO = new MemberPageObject();

export interface LoginMember extends Partial<MemberDetails> {
  email: string;
  password: string;
  expirationTime: any;
}

export class SignUpPageObject {
  public signupUrl = Routing.SignUp;
  public redirectUrl = Routing.Profile;

  public authToggleButton = "#auth-toggle";
  public emailExistsModal = "#email-exists";

  private signUpFormId = "#sign-up-form";
  public signUpForm = {
    id: this.signUpFormId,
    membershipSelect: `${this.signUpFormId}-membership-id`,
    membershipOptions: `${this.signUpFormId}-{ID}`,
    discountCheckbox: `${this.signUpFormId}-discount`,
    firstnameInput: `${this.signUpFormId}-firstname`,
    lastnameInput: `${this.signUpFormId}-lastname`,
    emailInput: `${this.signUpFormId}-email`,
    passwordInput: `${this.signUpFormId}-password`,
    submitButton: `${this.signUpFormId}-submit`,
    error: `${this.signUpFormId}-error`,
  };

  public membershipSelectForm = {

  }

  public goToSignup = () => browser.get(this.signupUrl);

  public signUpUser = async (user: Partial<LoginMember>) => {
    await utils.fillInput(this.signUpForm.firstnameInput, user.firstname);
    await utils.fillInput(this.signUpForm.lastnameInput, user.lastname);
    await utils.fillInput(this.signUpForm.emailInput, user.email);
    await utils.fillInput(this.signUpForm.passwordInput, user.password);
    await utils.clickElement(this.signUpForm.submitButton);
  }
}

export default new SignUpPageObject();