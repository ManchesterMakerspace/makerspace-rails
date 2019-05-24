import * as moment from "moment";
import { basicUser, adminUser } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";

import auth from "../pageObjects/auth";
import header from "../pageObjects/header";
import utils from "../pageObjects/common";
import billingPO from "../pageObjects/billing";
import { defaultBillingOption, defaultBillingOptions } from "../constants/invoice";

describe("Admin Billing Options", () => {
  const initBillingOption = {
    ...defaultBillingOption,
  };

  beforeEach(async () => {
    return auth.autoLogin(adminUser, undefined, { billing: true }).then(async () => {
      await mock(mockRequests.transactions.get.ok(defaultBillingOptions, {}, true));
      await header.navigateTo(header.links.billing);
      // TODO: select transactions tab
      await utils.waitForPageLoad(billingPO.url);
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
    await utils.fillInput(billingPO.invoiceOptionForm.quantity, initBillingOption.quantity);
    await utils.fillInput(billingPO.invoiceOptionForm.name, initBillingOption.name);
    await utils.fillInput(billingPO.invoiceOptionForm.description, initBillingOption.description);
    await utils.selectDropdownByValue(billingPO.invoiceOptionForm.resourceClass, initBillingOption.resourceClass);

    await mock(mockRequests.rentals.post.ok(initBillingOption));
    await mock(mockRequests.rentals.get.ok([initBillingOption], undefined, true));
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
      amount: 500
    }
    await billingPO.selectRow(defaultBillingOptions[0].id);
    await utils.clickElement(billingPO.actionButtons.editButton);
    await utils.waitForVisible(billingPO.invoiceOptionForm.submit);

    await utils.fillInput(billingPO.invoiceOptionForm.quantity, initBillingOption.quantity);
    await utils.fillInput(billingPO.invoiceOptionForm.description, updatedBillingOption.description);
    await mock(mockRequests.rentals.put.ok(updatedBillingOption));
    await mock(mockRequests.rentals.get.ok([updatedBillingOption], undefined, true));
    await utils.clickElement(billingPO.invoiceOptionForm.submit);
    await utils.waitForNotVisible(billingPO.invoiceOptionForm.submit);
    expect((await billingPO.getAllRows()).length).toEqual(1);
    await billingPO.verifyFields(updatedBillingOption, billingPO.fieldEvaluator());
  });

  it("Can delete billing options", async () => {
    await billingPO.selectRow(defaultBillingOptions[0].id);
    await utils.clickElement(billingPO.actionButtons.deleteButton);
    await utils.waitForVisible(billingPO.deleteModal.submit);
    expect(await utils.getElementText(billingPO.deleteModal.member)).toEqual(defaultBillingOptions[0].memberName);
    expect(await utils.getElementText(billingPO.deleteModal.quantity)).toEqual(defaultBillingOptions[0].quantity);
    expect(await utils.getElementText(billingPO.deleteModal.description)).toEqual(defaultBillingOptions[0].description);
    await mock(mockRequests.rentals.delete.ok(defaultBillingOptions[0].id));
    await mock(mockRequests.rentals.get.ok([], undefined, true));
    await utils.clickElement(billingPO.deleteModal.submit);
    await utils.waitForNotVisible(billingPO.deleteModal.submit);
    await utils.waitForVisible(billingPO.getNoDataRowId());
  });
});
