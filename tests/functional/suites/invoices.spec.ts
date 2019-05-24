import { Invoice } from "app/entities/invoice";

import { basicUser, adminUser } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";
import auth from "../pageObjects/auth";
import utils from "../pageObjects/common";
import memberPO from "../pageObjects/member";
import invoicePO from "../pageObjects/invoice";
import { pastDueInvoice, settledInvoice, defaultInvoice, defaultInvoices } from "../constants/invoice";
import { SortDirection } from "ui/common/table/constants";
import { checkout } from "../pageObjects/checkout";
import { paymentMethods, creditCard } from "../pageObjects/paymentMethods";
import { creditCard as defaultCreditCard, creditCardForm } from "../constants/paymentMethod";

const initInvoices = [defaultInvoice, pastDueInvoice, settledInvoice];

describe("Invoicing and Dues", () => {
  describe("Basic User", () => {
    const loadInvoices = async (invoices: Invoice[], login?: boolean) => {
      await mock(mockRequests.invoices.get.ok(invoices));
      if (login) {
        await auth.autoLogin(basicUser);
        expect(await browser.getCurrentUrl()).toEqual(utils.buildUrl(memberPO.getProfilePath(basicUser.id)));
      }
    }

    it("Members can log in and pay outstanding dues", async () => {
      /* 1. Login as basic user
      /* 2. Setup Mocks
          - Load invoices (2 results: 1 upcoming, 1 past due)
          - Pay invoice (for past due result)
          - Load invoices (2 results: 1 upcoming, 1 paid)
        3. Assert table loads correctly
        4. Select past due invoice from table
        5. Click Checkout
        6. Assert directed to checkout form
        TODO
        7. Select payment method & submit
        8. Assert checkout summary page
        9. Submit
        10. Assert checkout complete confirmation page
        11. Click 'Return to Profile'
        12. Assert invoices displayed in table
      */
      const newCard = {
        ...defaultCreditCard,
        nonce: "foobar"
      }
      await loadInvoices(initInvoices, true);
      expect((await invoicePO.getAllRows()).length).toEqual(1);
      expect(await invoicePO.getColumnText("name", defaultInvoice.id)).toEqual(defaultInvoice.name);

      // Get payment methods (none array)
      // Checkout
      await mock(mockRequests.paymentMethods.get.ok([newCard]));
      await utils.clickElement(invoicePO.actionButtons.payNow);
      await utils.waitForPageLoad(checkout.checkoutUrl);

      // TODO Find a way to mock creating a payment method
      // await mock(mockRequests.paymentMethods.new.ok("foo"));
      // await utils.clickElement(paymentMethods.addPaymentButton);
      // await utils.waitForVisible(paymentMethods.paymentMethodFormSelect.creditCard);
      // await utils.clickElement(paymentMethods.paymentMethodFormSelect.creditCard);
      // await utils.waitForVisible(creditCard.creditCardForm.submit);
      // await utils.fillInput(creditCard.creditCardForm.cardNumber, creditCardForm.cardNumber);
      // await utils.fillInput(creditCard.creditCardForm.expirationDate, creditCardForm.expiration);
      // await utils.fillInput(creditCard.creditCardForm.postalCode, creditCardForm.postalCode);
      // await utils.fillInput(creditCard.creditCardForm.csv, creditCardForm.csv);
      // await mock(mockRequests.paymentMethods.post.ok(newCard.nonce, newCard.id));
      // await utils.clickElement(creditCard.creditCardForm.submit);

      // Submit payment
      await mock(mockRequests.transactions.post.ok(defaultInvoice.id, newCard.id));
      await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
      await utils.clickElement(paymentMethods.getPaymentMethodSelectId(newCard.id));
      expect(await utils.getElementText(checkout.total)).toEqual(`Total $${defaultInvoice.amount}.00`);
      await utils.clickElement(checkout.submit);
      await utils.assertNoInputError(checkout.checkoutError, true);
      // Wait for profile redirect
      // TODO: Verify receipt
      await utils.waitForPageLoad(memberPO.getProfilePath(basicUser.id));
    });
  });
  describe("Admin User", () => {
    const targetUrl = memberPO.getProfilePath(basicUser.id);
    const loadInvoices = async (invoices: Invoice[], login?: boolean) => {
      await mock(mockRequests.invoices.get.ok(invoices, { order: SortDirection.Asc, resourceId: basicUser.id }, true));
      if (login) {
        await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
        await auth.autoLogin(adminUser, targetUrl, { billing: true });
        expect(await browser.getCurrentUrl()).toEqual(utils.buildUrl(targetUrl));
      }
    }

    it("Can create new invoices for members", async () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load invoices (0 results)
          - Create invoice
          - Load invoices (1 result)
         3. Click 'Create Invoice' button
         4. Fill out form & submit
         5. Assert new invoice loaded in profile page
      */
      await loadInvoices([], true);
      const { submit, description, amount, dueDate } = invoicePO.invoiceForm;
      expect(await utils.isElementDisplayed(invoicePO.getErrorRowId())).toBeFalsy();
      expect(await utils.isElementDisplayed(invoicePO.getNoDataRowId())).toBeTruthy();
      await utils.clickElement(invoicePO.actionButtons.create);
      await utils.waitForVisible(submit);
      await utils.fillInput(description, defaultInvoice.description);
      await utils.fillInput(dueDate, new Date(defaultInvoice.dueDate).toDateString());
      await utils.fillInput(amount, `${defaultInvoice.amount}`);

      await mock(mockRequests.invoices.post.ok(defaultInvoice));
      await mock(mockRequests.invoices.get.ok([defaultInvoice]));
      await utils.clickElement(submit);
      await utils.waitForNotVisible(submit);
      expect((await invoicePO.getAllRows()).length).toEqual(1);
    });
    it("Can edit invoices for memebrs", async () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load invoices (1 result)
          - Edit invoice
          - Load invoices (1 result)
         3. Click 'Edit Invoice' button
         4. Fill out form & submit
         5. Assert updated invoice loaded in profile page
      */
      const updatedInvoice = {
        ...defaultInvoices[0],
        description: "bar",
        amount: 500
      }
      await invoicePO.selectRow(defaultInvoices[0].id);
      await utils.clickElement(invoicePO.actionButtons.edit);
      await utils.waitForVisible(invoicePO.invoiceForm.submit);

      await utils.fillInput(invoicePO.invoiceForm.amount, updatedInvoice.amount);
      await utils.fillInput(invoicePO.invoiceForm.description, updatedInvoice.description);
      await mock(mockRequests.rentals.put.ok(updatedInvoice));
      await mock(mockRequests.rentals.get.ok([updatedInvoice], undefined, true));
      await utils.clickElement(invoicePO.invoiceForm.submit);
      await utils.waitForNotVisible(invoicePO.invoiceForm.submit);
      expect((await invoicePO.getAllRows()).length).toEqual(1);
      await invoicePO.verifyFields(updatedInvoice, invoicePO.fieldEvaluator());
    });
    it("Can delete invoices for members", async () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load invoices
          - Delete invoice
          - Load invoices (0 result)
         3. Click 'Delete Invoice' button
         4. Confirm modal
         5. Assert invoice not loaded in profile page
      */
      await invoicePO.selectRow(defaultInvoices[0].id);
      await utils.clickElement(invoicePO.actionButtons.delete);
      await utils.waitForVisible(invoicePO.deleteInvoiceModal.submit);
      expect(await utils.getElementText(invoicePO.deleteInvoiceModal.member)).toEqual(defaultInvoices[0].memberName);
      expect(await utils.getElementText(invoicePO.deleteInvoiceModal.amount)).toEqual(defaultInvoices[0].amount);
      expect(await utils.getElementText(invoicePO.deleteInvoiceModal.description)).toEqual(defaultInvoices[0].description);
      await mock(mockRequests.rentals.delete.ok(defaultInvoices[0].id));
      await mock(mockRequests.rentals.get.ok([], undefined, true));
      await utils.clickElement(invoicePO.deleteInvoiceModal.submit);
      await utils.waitForNotVisible(invoicePO.deleteInvoiceModal.submit);
      await utils.waitForVisible(invoicePO.getNoDataRowId());
    });
    xit("Invoice Form Validation", () => {

    });
  });
});