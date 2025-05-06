import { expect } from "chai";
import { basicUser, adminUser } from "../../constants/member";

import header from "../../pageObjects/header";
import utils from "../../pageObjects/common";
import billingPO from "../../pageObjects/billing";
import { defaultBillingOption, defaultBillingOptions, defaultInvoice } from "../../constants/invoice";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { autoLogin } from "../autoLogin";
import { loadMockserver } from "../mockserver";
import { InvoiceableResource, NewInvoiceOption } from "makerspace-ts-mock-client";

const mocker = loadMockserver();

describe("Admin Billing Options", () => {
  const initBillingOption = {
    ...defaultBillingOption,
  };
  afterEach(() => mocker.reset());

  beforeEach(async () => {
    return autoLogin(mocker, adminUser, undefined, { billing: true }).then(async () => {
      mocker.listInvoiceOptions_200({ types: [InvoiceableResource.Member] }, defaultBillingOptions);
      await header.navigateTo(header.links.billing);
      await utils.waitForPageLoad(billingPO.url);
      await billingPO.goToOptions();
      await utils.waitForVisible(billingPO.getTitleId());
      expect(await utils.isElementDisplayed(billingPO.getErrorRowId())).to.be.false;
      expect(await utils.isElementDisplayed(billingPO.getNoDataRowId())).to.be.false;
      expect(await utils.isElementDisplayed(billingPO.getLoadingId())).to.be.false;
      expect(await utils.isElementDisplayed(billingPO.getTitleId())).to.be.true;
    });
  });

  it("Loads a list of billing options", async () => {
    await billingPO.verifyListView(defaultBillingOptions, billingPO.fieldEvaluator());
  });
  it("Can create new billing options", async () => {
    await utils.clickElement(billingPO.actionButtons.createButton);
    await utils.waitForVisible(billingPO.invoiceOptionForm.submit);
    await utils.fillInput(billingPO.invoiceOptionForm.quantity, String(initBillingOption.quantity));
    await utils.fillInput(billingPO.invoiceOptionForm.name, initBillingOption.name);
    await utils.fillInput(billingPO.invoiceOptionForm.description, initBillingOption.description);
    await utils.fillInput(billingPO.invoiceOptionForm.amount, String(initBillingOption.amount));
    // TODO create member & rental options
    // await utils.selectDropdownByValue(billingPO.invoiceOptionForm.resourceClass, initBillingOption.resourceClass);

    const { id, planId, ...billingOptPayload } = initBillingOption;
    mocker.adminCreateInvoiceOption_200({ body: billingOptPayload as NewInvoiceOption }, initBillingOption);
    mocker.listInvoiceOptions_200({ }, [initBillingOption]);
    await utils.clickElement(billingPO.invoiceOptionForm.submit);
    await utils.waitForNotVisible(billingPO.invoiceOptionForm.submit);
    expect((await billingPO.getAllRows()).length).to.eql(1);
    await billingPO.verifyFields(initBillingOption, billingPO.fieldEvaluator(basicUser));
  });

  it("Can edit billing options", async () => {
    const updatedBillingOption = {
      ...defaultBillingOptions[0],
      description: "bar",
      name: "edited option",
    }
    await billingPO.selectRow(defaultBillingOptions[0].id);
    await utils.clickElement(billingPO.actionButtons.editButton);
    await utils.waitForVisible(billingPO.invoiceOptionForm.submit);

    expect(await utils.getElementAttribute(billingPO.invoiceOptionForm.quantity, 'disabled')).to.eql("true");
    expect(await utils.getElementAttribute(billingPO.invoiceOptionForm.amount, 'disabled')).to.eql("true");
    await utils.fillInput(billingPO.invoiceOptionForm.description, updatedBillingOption.description);
    await utils.fillInput(billingPO.invoiceOptionForm.name, updatedBillingOption.name);
    const { id, ...billingOptPayload } = updatedBillingOption;
    mocker.adminUpdateInvoiceOption_200({ body: billingOptPayload as any, id: updatedBillingOption.id }, updatedBillingOption);
    mocker.listInvoiceOptions_200({}, [updatedBillingOption]);
    await utils.clickElement(billingPO.invoiceOptionForm.submit);
    await utils.waitForNotVisible(billingPO.invoiceOptionForm.submit);
    expect((await billingPO.getAllRows()).length).to.eql(1);
    await billingPO.verifyFields(updatedBillingOption, billingPO.fieldEvaluator());
  });

  it("Can delete billing options", async () => {
    await billingPO.selectRow(defaultBillingOptions[0].id);
    await utils.clickElement(billingPO.actionButtons.deleteButton);
    await utils.waitForVisible(billingPO.deleteModal.submit);
    expect(await utils.getElementText(billingPO.deleteModal.name)).to.eql(defaultBillingOptions[0].name);
    expect(await utils.getElementText(billingPO.deleteModal.amount)).to.eql(numberAsCurrency(defaultBillingOptions[0].amount));
    expect(await utils.getElementText(billingPO.deleteModal.description)).to.eql(defaultBillingOptions[0].description);
    mocker.adminDeleteInvoiceOption_204({ id: defaultBillingOptions[0].id });
    mocker.listInvoiceOptions_200({}, []);
    await utils.clickElement(billingPO.deleteModal.submit);
    await utils.waitForNotVisible(billingPO.deleteModal.submit);
    await utils.waitForVisible(billingPO.getNoDataRowId());
  });

  it("Billing option form validation", async () => {
    // TODO validate all fields required for create, that can select plan & discount
    //
  })
});
