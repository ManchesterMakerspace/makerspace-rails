import { Routing } from "app/constants";
import { Member } from "makerspace-ts-api-client";
import utils from "./common";

export interface LoginMember extends Partial<Member> {
  email: string;
  password: string;
  expirationTime: any;
}

export class SignUpPageObject {
  public signupUrl = Routing.SignUp;
  public redirectUrl = Routing.Profile;

  private signUpFormId = "#sign-up-form";
  public signUpForm = {
    id: this.signUpFormId,
    firstnameInput: `${this.signUpFormId}-firstname`,
    lastnameInput: `${this.signUpFormId}-lastname`,
    emailInput: `${this.signUpFormId}-email`,
    streetInput: `${this.signUpFormId}-street`,
    unitInput: `${this.signUpFormId}-unit`,
    cityInput: `${this.signUpFormId}-city`,
    stateSelect: `${this.signUpFormId}-state`,
    zipInput: `${this.signUpFormId}-postalCode`,
    passwordInput: `${this.signUpFormId}-password`,
    error: `${this.signUpFormId}-error`,
  };

  private membershipSelectTableId = "#membership-select-table";
  private getRow = (id: string, selector: string) => selector.replace("{ID}", id);
  public membershipSelectForm = {
    id: this.membershipSelectTableId,
    headers: {
      name: `${this.membershipSelectTableId}-name-header`,
      description: `${this.membershipSelectTableId}-description-header`,
      amount: `${this.membershipSelectTableId}-amount-header`,
    },
    row: {
      id: `${this.membershipSelectTableId}-{ID}`,
      select: `${this.membershipSelectTableId}-{ID}-select-button`,
      name: `${this.membershipSelectTableId}-{ID}-name`,
      description: `${this.membershipSelectTableId}-{ID}-description`,
      amount: `${this.membershipSelectTableId}-{ID}-amount`,
    },
    error: `${this.membershipSelectTableId}-error-row`,
    noData: `${this.membershipSelectTableId}-no-data-row`,
    loading: `${this.membershipSelectTableId}-loading`,
    discountCheckbox: "#discount-select",
  };

  private codeOfConductFormId = "#code-of-conduct-form";
  public documentsSigning = {
    codeOfConductCheckbox: `#code-of-conduct-checkbox`,
    codeOfConductSubmit: `${this.codeOfConductFormId}-submit`,
    codeOfConductError: `${this.codeOfConductFormId}-error`,
    memberContractCheckbox: `#member-contract-checkbox`,
    memberContractError: `#signature-error`,
    memberContractSignature: "canvas",
  }

  public goToSignup = () => browser.url(utils.buildUrl(this.signupUrl));

  public signUpUser = async (user: Partial<LoginMember>) => {
    await utils.fillInput(this.signUpForm.firstnameInput, user.firstname);
    await utils.fillInput(this.signUpForm.lastnameInput, user.lastname);
    await utils.fillInput(this.signUpForm.emailInput, user.email);
    await utils.fillInput(this.signUpForm.passwordInput, user.password);
    await utils.fillInput(this.signUpForm.streetInput, user.address.street);
    await utils.fillInput(this.signUpForm.cityInput, user.address.city);
    await utils.fillInput(this.signUpForm.zipInput, user.address.postalCode);
    await utils.selectDropdownByValue(this.signUpForm.stateSelect, user.address.state);
    await utils.clickElement(this.signUpControls.nextButton);
  }

  public signUpControls = {
    nextButton: "#sign-up-next",
    backButton: "#sign-up-back",
    cartPreview: "#cart-preview",
    discountId: "#discountId"
  }

  public reviewFields = {
    subtotal: "#subtotal",
    discountId: "#discountId",
    total: "#total"
  }

  public enterDiscountId = (discountId: string) => {
    return utils.fillInput(this.signUpControls.discountId, discountId);
  }

  public verifyReviewStep = async (
    subtotal: string,
    discountId: string,
    total: string
  ) => {
    await browser.waitUntil(async () => {
      const subtotalTxtField = await utils.getElementById(this.reviewFields.subtotal);
      const subtotalTxt = await subtotalTxtField.getText();
      return subtotalTxt.includes(subtotal);
    }, undefined, `Subtotal never equaled ${subtotal}`);

    await browser.waitUntil(async () => {
      const discountIdTxtField = await utils.getElementById(this.reviewFields.discountId);
      const discountTxt = await discountIdTxtField.getText();
      return discountTxt.includes(discountId);
    }, undefined, `Discount never equaled ${discountId}`);

    await browser.waitUntil(async () => {
      const totalTxtField = await utils.getElementById(this.reviewFields.total);
      const totalTxt = await totalTxtField.getText();
      return totalTxt.includes(total);
    }, undefined, `Total never equaled ${total}`);
  }

  public verifyDiscountId = async (expectedDiscount: string) => {
    return browser.waitUntil(async () => {
      const input = await utils.getElementById(this.signUpControls.discountId);
      await input.scrollIntoView();
      const discount = await input.getValue();
      return discount === expectedDiscount;
    }, undefined, `Discount field never equaled ${expectedDiscount}`);
  }

  public goBack = async () => {
    await utils.clickElement(this.signUpControls.backButton);
  }

  public goNext = async () => {
    await utils.clickElement(this.signUpControls.nextButton);
  }


  private duplicateInvoiceModalId = "#outstanding-invoice";
  public duplicateInvoiceModal = {
    submit: `${this.duplicateInvoiceModalId}-submit`,
    cancel: `${this.duplicateInvoiceModalId}-cancel`,
  }
  public acceptDuplicateInvoiceModal = () => utils.clickElement(this.duplicateInvoiceModal.submit);
  public ignoreDuplicateInvoiceModal = () => utils.clickElement(this.duplicateInvoiceModal.cancel);

  public selectMembershipOption = async (optionId: string, shouldRedirect: boolean) =>{
    await browser.waitUntil(async () => {
      const selector = this.getRow(optionId, this.membershipSelectForm.row.select);
      const element = await utils.getElementByCss(selector);
      const isSelected = (await element.getText()).toLowerCase() === "selected";
      if (!isSelected) {
        await utils.scrollToElement(selector);
        await utils.clickElement(selector);
      }
      if (shouldRedirect) {
        await utils.waitForNotVisible(selector);
        return true;
      } else {
        const isNowSelected = (await element.getText()).toLowerCase() === "selected";
        return isNowSelected;
      }
    }, undefined, `Selected membership ${optionId} never selected`);
  }

  public verifySelectedMembershipOption = async (optionId: string) => {
    await browser.waitUntil(async () => {
      const selector = this.getRow(optionId, this.membershipSelectForm.row.select);
      const element = await utils.getElementByCss(selector);
      await element.scrollIntoView();
      const isSelected = (await element.getText()).toLowerCase() === "selected";
      return isSelected;
    }, undefined, `Selected membership ${optionId} never selected`);
  }

  public signContract = async () => {
    const signatureElement = await utils.getElementByCss(this.documentsSigning.memberContractSignature);
    await signatureElement.moveTo(1, 100);
    await browser.buttonDown();
    await signatureElement.moveTo(100, 1);
    await signatureElement.moveTo(100, 100);
    await signatureElement.moveTo(1, 1);
    await browser.buttonUp();
  }
}

export default new SignUpPageObject();