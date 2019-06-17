import { Invoice, InvoiceableResource, MemberInvoice } from "app/entities/invoice";
import { Routing } from "app/constants";

import { basicUser, adminUser } from "../../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import invoicePO from "../../pageObjects/invoice";
import { pastDueInvoice, settledInvoice, defaultInvoice, defaultInvoices } from "../../constants/invoice";
import { SortDirection } from "ui/common/table/constants";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { checkout } from "../../pageObjects/checkout";
import { paymentMethods } from "../../pageObjects/paymentMethods";
import { creditCard as defaultCreditCard } from "../../constants/paymentMethod";
import { defaultBillingOptions } from "../../constants/invoice";
import { defaultTransactions } from "../../constants/transaction";
import { autoLogin } from "../autoLogin";

const initInvoices = [defaultInvoice, pastDueInvoice, settledInvoice];

describe("Invoicing and Dues", () => {
  describe("Basic User", () => {
    const loadInvoices = async (invoices: Invoice[], login?: boolean) => {
      await mock(mockRequests.invoices.get.ok(invoices));
      if (login) {
        await autoLogin(basicUser, undefined, { billing: true });
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

      const resourcedInvoices = initInvoices.map(invoice => ({
        ...invoice,
        resource: {
          ...basicUser
        }
      })) as any as MemberInvoice[]; // TODO: Ooops, I messed up my typings somewhere      

      // Upcoming, non subscription and past due invoices are automatically selected on load
      // So 2 of initInvoices will be autoselected on load
      await loadInvoices(resourcedInvoices, true);
      expect((await invoicePO.getAllRows()).length).toEqual(resourcedInvoices.length);
      expect(await invoicePO.getColumnText("description", resourcedInvoices[0].id)).toEqual(resourcedInvoices[0].description);

      // Get payment methods (none array)
      // Checkout
      await mock(mockRequests.paymentMethods.get.ok([newCard]));
      await utils.clickElement(invoicePO.actionButtons.payNow);
      await utils.waitForPageLoad(checkout.checkoutUrl);

      // Submit payment
      const pastDueTransaction = defaultTransactions[0];
      const defaultTransaction = defaultTransactions[1];
      await mock(mockRequests.transactions.post.ok(defaultTransaction));
      await mock(mockRequests.transactions.post.ok(pastDueTransaction));
      await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
      await utils.clickElement(paymentMethods.getPaymentMethodSelectId(newCard.id));
      const total = numberAsCurrency(defaultInvoice.amount + pastDueInvoice.amount);

      expect(await utils.getElementText(checkout.total)).toEqual(`Total ${total}`);
      await utils.clickElement(checkout.submit);
      await utils.assertNoInputError(checkout.checkoutError, true);
      // Wait for receipt
      await utils.waitForPageLoad(Routing.Receipt)
      // Verify transactions are displayed
      expect(await utils.isElementDisplayed(checkout.receiptTransactions(defaultTransaction.id))).toBeTruthy();
      expect(await utils.isElementDisplayed(checkout.receiptTransactions(pastDueTransaction.id))).toBeTruthy();
      // Return to profile
      await utils.clickElement(checkout.backToProfileButton);
      // Wait for profile redirect
      await utils.waitForPageLoad(memberPO.getProfilePath(basicUser.id));
    });
  });
  describe("Admin User", () => {
    const targetUrl = memberPO.getProfilePath(basicUser.id);
    const loadInvoices = async (invoices: Invoice[], login?: boolean) => {
      await mock(mockRequests.invoices.get.ok(invoices, { order: SortDirection.Asc, resourceId: basicUser.id }, true));
      if (login) {
        await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
        await autoLogin(adminUser, targetUrl, { billing: true });
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
     const newInvoice = {
       ...defaultInvoice,
       memberId: basicUser.id,
       memberName: `${basicUser.firstname} ${basicUser.lastname}`
     }
      await loadInvoices([], true);
      const { submit, description, amount, dueDate } = invoicePO.invoiceForm;
      expect(await utils.isElementDisplayed(invoicePO.getErrorRowId())).toBeFalsy();
      expect(await utils.isElementDisplayed(invoicePO.getNoDataRowId())).toBeTruthy();
      await mock(mockRequests.invoiceOptions.get.ok(defaultBillingOptions, { types: [InvoiceableResource.Membership] }));
      await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
      await utils.clickElement(invoicePO.actionButtons.create);
      await utils.waitForVisible(submit);
     
      await utils.selectDropdownByValue(invoicePO.invoiceForm.invoiceOption, defaultBillingOptions[0].id);
      // TODO: Test rest of form once custom billing is enabled
      // await utils.fillInput(description, defaultInvoice.description);
      // await utils.fillInput(dueDate, new Date(defaultInvoice.dueDate).toDateString());
      // await utils.fillInput(amount, String(defaultInvoice.amount));

      await mock(mockRequests.invoices.post.ok(newInvoice, true));
      await mock(mockRequests.invoices.get.ok([newInvoice], { order: SortDirection.Asc, resourceId: basicUser.id }, true));
      await utils.clickElement(submit);
      await utils.waitForNotVisible(submit);
      expect((await invoicePO.getAllRows()).length).toEqual(1);
    });
    // SKIPPING Test until custom billing enabled. Cant edit generated invoices
    xit("Can edit invoices for memebrs", async () => {
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
      await loadInvoices(defaultInvoices, true);
      await invoicePO.selectRow(defaultInvoices[0].id);
      await utils.clickElement(invoicePO.actionButtons.edit);
      await utils.waitForVisible(invoicePO.invoiceForm.submit);

      await utils.fillInput(invoicePO.invoiceForm.amount, String(updatedInvoice.amount));
      await utils.fillInput(invoicePO.invoiceForm.description, updatedInvoice.description);
      await mock(mockRequests.invoices.put.ok(updatedInvoice));
      await mock(mockRequests.invoices.get.ok([updatedInvoice], { order: SortDirection.Asc, resourceId: basicUser.id }, true));
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
      await loadInvoices(defaultInvoices, true);
      await invoicePO.selectRow(defaultInvoices[0].id);
      await utils.clickElement(invoicePO.actionButtons.delete);
      await utils.waitForVisible(invoicePO.deleteInvoiceModal.submit);
      expect(await utils.getElementText(invoicePO.deleteInvoiceModal.member)).toEqual(defaultInvoices[0].memberName);
      expect(await utils.getElementText(invoicePO.deleteInvoiceModal.amount)).toEqual(numberAsCurrency(defaultInvoices[0].amount));
      expect(await utils.getElementText(invoicePO.deleteInvoiceModal.description)).toEqual(defaultInvoices[0].description);
      await mock(mockRequests.invoices.delete.ok(defaultInvoices[0].id));
      await mock(mockRequests.invoices.get.ok([], { order: SortDirection.Asc, resourceId: basicUser.id }, true));
      await utils.clickElement(invoicePO.deleteInvoiceModal.submit);
      await utils.waitForNotVisible(invoicePO.deleteInvoiceModal.submit);
      await utils.waitForVisible(invoicePO.getNoDataRowId());
    });
    xit("Invoice Form Validation", () => {

    });
  });
});