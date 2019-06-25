import { basicUser, adminUser } from "../../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";

import header from "../../pageObjects/header";
import utils from "../../pageObjects/common";
import billingPO from "../../pageObjects/billing";
import { defaultBillingOption, defaultBillingOptions } from "../../constants/invoice";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { autoLogin } from "../autoLogin";

describe("Admin Billing Options", () => {
  const initBillingOption = {
    ...defaultBillingOption,
  };

  beforeEach(async () => {
    return autoLogin(adminUser, undefined, { billing: true }).then(async () => {
      await mock(mockRequests.invoiceOptions.get.ok(defaultBillingOptions, { types: [] }));
      await header.navigateTo(header.links.billing);
      await utils.waitForPageLoad(billingPO.url);
      await billingPO.goToOptions();
      await utils.waitForVisible(billingPO.getTitleId());
      expect(await utils.isElementDisplayed(billingPO.getErrorRowId())).toBeFalsy();
      expect(await utils.isElementDisplayed(billingPO.getNoDataRowId())).toBeFalsy();
      expect(await utils.isElementDisplayed(billingPO.getLoadingId())).toBeFalsy();
      expect(await utils.isElementDisplayed(billingPO.getTitleId())).toBeTruthy();
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

    await mock(mockRequests.invoiceOptions.post.ok(initBillingOption));
    await mock(mockRequests.invoiceOptions.get.ok([initBillingOption], { types: [] }));
    await utils.clickElement(billingPO.invoiceOptionForm.submit);
    await utils.waitForNotVisible(billingPO.invoiceOptionForm.submit);
    expect((await billingPO.getAllRows()).length).toEqual(1);
    await billingPO.verifyFields(initBillingOption, billingPO.fieldEvaluator(basicUser));
  });

  it("Can edit billing options", async () => {
    const updatedBillingOption = {
      ...defaultBillingOptions[0],
      quantity: 11,
      description: "bar",
      name: "edited option",
      amount: 500
    }
    await billingPO.selectRow(defaultBillingOptions[0].id);
    await utils.clickElement(billingPO.actionButtons.editButton);
    await utils.waitForVisible(billingPO.invoiceOptionForm.submit);

    expect(await utils.getElementAttribute(billingPO.invoiceOptionForm.quantity, 'disabled')).toBe("true");
    expect(await utils.getElementAttribute(billingPO.invoiceOptionForm.amount, 'disabled')).toBe("true");
    await utils.fillInput(billingPO.invoiceOptionForm.description, updatedBillingOption.description);
    await utils.fillInput(billingPO.invoiceOptionForm.name, updatedBillingOption.name);
    await mock(mockRequests.invoiceOptions.put.ok(updatedBillingOption));
    await mock(mockRequests.invoiceOptions.get.ok([updatedBillingOption], undefined));
    await utils.clickElement(billingPO.invoiceOptionForm.submit);
    await utils.waitForNotVisible(billingPO.invoiceOptionForm.submit);
    expect((await billingPO.getAllRows()).length).toEqual(1);
    await billingPO.verifyFields(updatedBillingOption, billingPO.fieldEvaluator());
  });

  it("Can delete billing options", async () => {
    await billingPO.selectRow(defaultBillingOptions[0].id);
    await utils.clickElement(billingPO.actionButtons.deleteButton);
    await utils.waitForVisible(billingPO.deleteModal.submit);
    expect(await utils.getElementText(billingPO.deleteModal.name)).toEqual(defaultBillingOptions[0].name);
    expect(await utils.getElementText(billingPO.deleteModal.amount)).toEqual(numberAsCurrency(defaultBillingOptions[0].amount));
    expect(await utils.getElementText(billingPO.deleteModal.description)).toEqual(defaultBillingOptions[0].description);
    await mock(mockRequests.invoiceOptions.delete.ok(defaultBillingOptions[0].id));
    await mock(mockRequests.invoiceOptions.get.ok([], undefined));
    await utils.clickElement(billingPO.deleteModal.submit);
    await utils.waitForNotVisible(billingPO.deleteModal.submit);
    await utils.waitForVisible(billingPO.getNoDataRowId());
  });

  it("Billing option form validation", async () => {
    // TODO validate all fields required for create, that can select plan & discount
    // 
  })
});
