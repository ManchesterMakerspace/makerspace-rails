import { expect } from "chai";
import { MemberInvoice } from "app/entities/invoice";
import { Routing } from "app/constants";
import { Invoice, Member, InvoiceableResource } from "makerspace-ts-api-client";

import { basicUser, adminUser } from "../../constants/member";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import invoicePO from "../../pageObjects/invoice";
import { pastDueInvoice, settledInvoice, defaultInvoice, defaultInvoices } from "../../constants/invoice";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { checkout } from "../../pageObjects/checkout";
import { paymentMethods } from "../../pageObjects/paymentMethods";
import { creditCard as defaultCreditCard } from "../../constants/paymentMethod";
import { defaultBillingOptions } from "../../constants/invoice";
import { defaultTransaction, defaultTransactions } from "../../constants/transaction";
import { autoLogin } from "../autoLogin";
import { defaultBillingOptions as invoiceOptions, membershipOptionQueryParams } from "../../constants/invoice";
import signup from "../../pageObjects/signup";
import settings from "../../pageObjects/settings";
import header from "../../pageObjects/header";
import { loadMockserver } from "../mockserver";
import { generateClientToken, loadBraintreeMockserver, mockBraintreeTokenValidation } from "../../constants/braintreeMockserver";
const mocker = loadMockserver();
loadBraintreeMockserver();

const initInvoices = [pastDueInvoice, settledInvoice];
const resourcedInvoices: MemberInvoice[] = initInvoices.map(invoice => ({
  ...invoice,
  memberId: basicUser.id,
  member: {
    ...basicUser as Member
  }
}));

describe("Invoicing and Dues", () => {
  describe("Basic User", () => {
    const loadInvoices = async (invoices: Invoice[], login?: boolean) => {
      mocker.listInvoices_200({}, invoices);
      if (login) {
        await autoLogin(mocker, basicUser, undefined, { billing: true });
        expect(await browser.getUrl()).to.eql(utils.buildUrl(memberPO.getProfilePath(basicUser.id)));
      }
    }

    beforeEach(() => {
      mocker.getNewPaymentMethod_200({
        clientToken: generateClientToken()
      }, { unlimited: true });
      mockBraintreeTokenValidation(defaultCreditCard);
    });

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

      // Upcoming, non subscription and past due invoices are automatically targeted on load
      // Only 1 can be selected at a time tho
      await loadInvoices(resourcedInvoices, true);
      expect((await invoicePO.getAllRows()).length).to.eql(resourcedInvoices.length);

      // Get payment methods (none array)
      // Checkout
      mocker.listPaymentMethods_200([newCard]);
      await utils.clickElement(invoicePO.actionButtons.payNow);
      await utils.waitForPageLoad(checkout.checkoutUrl);

      // Submit payment
      const pastDueTransaction = { ...defaultTransactions[0], invoice: resourcedInvoices[0] };
      mocker.createTransaction_200({ body: { invoiceId: resourcedInvoices[0].id, paymentMethodId: newCard.id } }, pastDueTransaction);
      mocker.getMember_200({ id: basicUser.id }, basicUser);
      await utils.clickElement(paymentMethods.getPaymentMethodSelectId(newCard.id));

      await utils.clickElement(checkout.nextButton);
      expect(await utils.getElementText(checkout.total)).to.eql(
        `Total ${numberAsCurrency(Number(pastDueInvoice.amount))}`
      );
      await utils.clickElement(checkout.submit);
      await utils.assertNoInputError(checkout.checkoutError, true);
      // Wait for receipt
      await utils.waitForPageToMatch(Routing.Receipt)
      // Verify transactions are displayed
      expect(await utils.isElementDisplayed(checkout.receiptContainer)).to.be.true;
      // Return to profile
      await utils.clickElement(checkout.backToProfileButton);
      // Wait for profile redirect
      await utils.waitForPageLoad(memberPO.getProfilePath(basicUser.id));
    });

    it("Warns you if you're about to purchase a duplicate category", async () => {
      mocker.listPaymentMethods_200([defaultCreditCard]);
      mocker.getPaymentMethod_200({ id: defaultCreditCard.id }, defaultCreditCard);
      await loadInvoices(resourcedInvoices, true);

      // Mock a member that already has a membership invoice
      const membershipOption = {
        ...invoiceOptions[0],
        resourceClass: InvoiceableResource.Member
      };
      mocker.listInvoiceOptions_200(membershipOptionQueryParams, [membershipOption], { unlimited: true });

      mocker.getMember_200({ id: basicUser.id }, basicUser);
      await header.navigateTo(header.links.settings);
      await utils.waitForPageToMatch(settings.pageUrl);

      mocker.getMember_200({ id: basicUser.id }, basicUser);
      mocker.listInvoices_200({}, [{
        ...pastDueInvoice,
        subscriptionId: "foobar-sub",
        resourceClass: InvoiceableResource.Member
      }], { times: 2 });
      await settings.goToMembershipSettings();

      // Non subscription details displayed
      await utils.waitForNotVisible(settings.nonSubscriptionDetails.loading);
      expect(await utils.isElementDisplayed(settings.nonSubscriptionDetails.status)).to.be.true;
      expect(await utils.isElementDisplayed(settings.subscriptionDetails.status)).to.be.false;

      // Select a subscription
      await utils.clickElement(settings.nonSubscriptionDetails.createSubscription);
      await utils.waitForNotVisible(signup.membershipSelectForm.loading);

      // Duplicate notification b/c trying to buy membership even tho have membership invoice
      await utils.waitForVisible(signup.duplicateInvoiceModal.submit);
      // Ignore and continue to checkout
      await signup.ignoreDuplicateInvoiceModal();
      await signup.selectMembershipOption(membershipOption.id, false);
      await signup.goNext();
      await utils.clickElement(paymentMethods.getPaymentMethodSelectId(defaultCreditCard.id));
      mocker.createTransaction_200({ body: { invoiceOptionId: membershipOption.id, paymentMethodId: defaultCreditCard.id } }, defaultTransaction);
      await signup.goNext();
      await utils.waitForVisible(checkout.authAgreementCheckbox);
      await utils.clickElement(checkout.authAgreementCheckbox);
      await signup.goNext();
      await utils.waitForPageLoad(memberPO.getProfilePath(basicUser.id));
    });

    it("Redirects to profile if you accept duplicate invoice notice", async () => {
      await loadInvoices(resourcedInvoices, true);

      // Mock a member that already has a membership invoice
      const membershipOption = {
        ...invoiceOptions[0],
        resourceClass: InvoiceableResource.Member
      };
      mocker.listInvoiceOptions_200(membershipOptionQueryParams, [membershipOption], { unlimited: true });

      mocker.getMember_200({ id: basicUser.id }, basicUser);
      await header.navigateTo(header.links.settings);
      await utils.waitForPageToMatch(settings.pageUrl);

      mocker.getMember_200({ id: basicUser.id }, basicUser);
      mocker.listInvoices_200({}, [{
        ...pastDueInvoice,
        subscriptionId: "foobar-sub",
        resourceClass: InvoiceableResource.Member
      }], { times: 2 });
      await settings.goToMembershipSettings();

      // Non subscription details displayed
      await utils.waitForNotVisible(settings.nonSubscriptionDetails.loading);
      expect(await utils.isElementDisplayed(settings.nonSubscriptionDetails.status)).to.be.true;
      expect(await utils.isElementDisplayed(settings.subscriptionDetails.status)).to.be.false;

      // Select a subscription
      await utils.clickElement(settings.nonSubscriptionDetails.createSubscription);
      await utils.waitForNotVisible(signup.membershipSelectForm.loading);

      // Duplicate notification b/c trying to buy membership even tho have membership invoice
      await utils.waitForVisible(signup.duplicateInvoiceModal.submit);
      await signup.acceptDuplicateInvoiceModal();
      // Accept and be redirected to profile (Dues are default displayed)
      await utils.waitForPageLoad(memberPO.getProfilePath(basicUser.id));
    });
  });
  describe("Admin User", () => {
    const targetUrl = memberPO.getProfilePath(basicUser.id);
    const loadInvoices = async (invoices: Invoice[], login?: boolean) => {
      mocker.adminListInvoices_200({}, invoices);
      if (login) {
        mocker.getMember_200({ id: basicUser.id }, basicUser);
        await autoLogin(mocker, adminUser, targetUrl, { billing: true });
        expect(await browser.getUrl()).to.eql(utils.buildUrl(targetUrl));
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
        resourceId: basicUser.id,
        resourceClass: InvoiceableResource.Member,
        memberName: `${basicUser.firstname} ${basicUser.lastname}`
      }
      mocker.listInvoiceOptions_200({ types: [InvoiceableResource.Member] }, defaultBillingOptions);
      await loadInvoices([], true);
      const { submit, description, amount, dueDate } = invoicePO.invoiceForm;
      expect(await utils.isElementDisplayed(invoicePO.getErrorRowId())).to.be.false;
      expect(await utils.isElementDisplayed(invoicePO.getNoDataRowId())).to.be.true;
      mocker.getMember_200({ id: basicUser.id }, basicUser);
      await utils.clickElement(invoicePO.actionButtons.create);
      await utils.waitForVisible(submit);

      await utils.selectDropdownByValue(invoicePO.invoiceForm.invoiceOption, defaultBillingOptions[0].id);
      // TODO: Test rest of form once custom billing is enabled
      // await utils.fillInput(description, defaultInvoice.description);
      // await utils.fillInput(dueDate, new Date(defaultInvoice.dueDate).toDateString());
      // await utils.fillInput(amount, String(defaultInvoice.amount));

      const { memberId, resourceId, resourceClass } = newInvoice;
      mocker.adminCreateInvoices_200({ body: { memberId, id: defaultBillingOptions[0].id, resourceId } }, newInvoice);
      mocker.adminListInvoices_200({}, [newInvoice]);
      await utils.clickElement(submit);
      await utils.waitForNotVisible(submit);
      expect((await invoicePO.getAllRows()).length).to.eql(1);
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
        amount: "500"
      }
      await loadInvoices(defaultInvoices, true);
      await invoicePO.selectRow(defaultInvoices[0].id);
      await utils.clickElement(invoicePO.actionButtons.edit);
      await utils.waitForVisible(invoicePO.invoiceForm.submit);

      await utils.fillInput(invoicePO.invoiceForm.amount, String(updatedInvoice.amount));
      await utils.fillInput(invoicePO.invoiceForm.description, updatedInvoice.description);
      mocker.adminUpdateInvoice_200({ id: updatedInvoice.id, body: updatedInvoice }, updatedInvoice);
      mocker.adminListInvoices_200({}, [updatedInvoice]);
      await utils.clickElement(invoicePO.invoiceForm.submit);
      await utils.waitForNotVisible(invoicePO.invoiceForm.submit);
      expect((await invoicePO.getAllRows()).length).to.eql(1);
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
      expect(await utils.getElementText(invoicePO.deleteInvoiceModal.member)).to.eql(defaultInvoices[0].memberName);
      expect(await utils.getElementText(invoicePO.deleteInvoiceModal.amount)).to.eql(numberAsCurrency(defaultInvoices[0].amount));
      expect(await utils.getElementText(invoicePO.deleteInvoiceModal.description)).to.eql(defaultInvoices[0].description);
      mocker.adminDeleteInvoice_204({ id: defaultInvoices[0].id });
      mocker.adminListInvoices_200({}, []);
      await utils.clickElement(invoicePO.deleteInvoiceModal.submit);
      await utils.waitForNotVisible(invoicePO.deleteInvoiceModal.submit);
      await utils.waitForVisible(invoicePO.getNoDataRowId());
    });
    xit("Invoice Form Validation", () => {

    });
  });
});