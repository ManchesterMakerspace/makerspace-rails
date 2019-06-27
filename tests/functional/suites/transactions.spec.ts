import { basicUser, adminUser } from "../../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";

import header from "../../pageObjects/header";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import transactionsPO from "../../pageObjects/transactions";
import billingPO from "../../pageObjects/billing";
import { defaultTransaction, defaultTransactions } from "../../constants/transaction";
import { timeToDate } from "ui/utils/timeToDate";
import { autoLogin } from "../autoLogin";

xdescribe("Transactions", () => {
  describe("Basic user", () => {
    const customer = {
      ...basicUser,
      customerId: "foo"
    }
    const initTransaction = {
      ...defaultTransaction,
      memberId: customer.id,
      memberName: `${customer.firstname} ${customer.lastname}`,
    };
    beforeEach(() => {
      return autoLogin(customer, undefined, { billing: true });
    });
    it("Can review their transactions", async () => {
      await mock(mockRequests.transactions.get.ok(defaultTransactions));
      await memberPO.goToMemberTransactions();
      await utils.waitForVisible(transactionsPO.getTitleId());
      expect(await utils.isElementDisplayed(transactionsPO.getErrorRowId())).toBeFalsy();
      expect(await utils.isElementDisplayed(transactionsPO.getNoDataRowId())).toBeFalsy();
      expect(await utils.isElementDisplayed(transactionsPO.getLoadingId())).toBeFalsy();
      expect(await utils.isElementDisplayed(transactionsPO.getTitleId())).toBeTruthy();
      await transactionsPO.verifyListView(defaultTransactions, transactionsPO.fieldEvaluator());
    });
    it("Can request refund for transactions", async () => {
      await mock(mockRequests.transactions.get.ok([initTransaction], { memberId: customer.id }));
      await memberPO.goToMemberTransactions();
      await utils.waitForVisible(transactionsPO.getTitleId());
      await transactionsPO.selectRow(initTransaction.id);
      await utils.clickElement(transactionsPO.actionButtons.delete);
      await utils.waitForVisible(transactionsPO.refundTransactionModal.submit);
      expect(await utils.getElementText(transactionsPO.refundTransactionModal.member)).toEqual(`${customer.firstname} ${customer.lastname}`);
      expect(await utils.getElementText(transactionsPO.refundTransactionModal.amount)).toEqual(initTransaction.amount);
      await mock(mockRequests.transaction.delete.ok(initTransaction.id));
      await mock(mockRequests.transactions.get.ok([], { memberId: customer.id }));
      await utils.clickElement(transactionsPO.refundTransactionModal.submit);
      await utils.waitForNotVisible(transactionsPO.refundTransactionModal.submit);
      await utils.waitForVisible(transactionsPO.getNoDataRowId());
    });
  });
  describe("Admin user", () => {
    describe("From list view", () => {
      beforeEach(async () => {
        return autoLogin(adminUser, undefined, { billing: true }).then(async () => {
          await mock(mockRequests.transactions.get.ok(defaultTransactions, {}, true));
          await header.navigateTo(header.links.billing);
          await utils.waitForPageLoad(billingPO.url);
          await billingPO.goToTransactions();
          expect(await utils.isElementDisplayed(transactionsPO.getErrorRowId())).toBeFalsy();
          expect(await utils.isElementDisplayed(transactionsPO.getNoDataRowId())).toBeFalsy();
          expect(await utils.isElementDisplayed(transactionsPO.getLoadingId())).toBeFalsy();
          expect(await utils.isElementDisplayed(transactionsPO.getTitleId())).toBeTruthy();
        });
      });
      it("Loads a list of transactions", async () => {
        await transactionsPO.verifyListView(defaultTransactions, transactionsPO.fieldEvaluator());
      });

      it("Can refund transactions for members", async () => {
        await transactionsPO.selectRow(defaultTransactions[0].id);
        await utils.clickElement(transactionsPO.transactionsList.deleteButton);
        await utils.waitForVisible(transactionsPO.refundTransactionModal.submit);
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.date)).toEqual(timeToDate(defaultTransactions[0].createdAt));
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.amount)).toEqual(defaultTransactions[0].amount);
        await mock(mockRequests.transaction.delete.ok(defaultTransactions[0].id, true));
        await mock(mockRequests.transactions.get.ok([], undefined, true));
        await utils.clickElement(transactionsPO.refundTransactionModal.submit);
        await utils.waitForNotVisible(transactionsPO.refundTransactionModal.submit);
        await utils.waitForVisible(transactionsPO.getNoDataRowId());
      });
    });

    describe("From a user's profile", () => {
      const customer = {
        ...basicUser,
        customerId: "foo"
      }
      const targetUrl = memberPO.getProfilePath(customer.id);
      const initTransaction = {
        ...defaultTransaction,
        memberId: customer.id,
        memberName: `${customer.firstname} ${customer.lastname}`,
      };
      beforeEach(() => {
        return new Promise(async (resolve) => {
          // 1. Login as admin and nav to basic user's profile
          await mock(mockRequests.member.get.ok(customer.id, customer));
          return autoLogin(adminUser, targetUrl, { billing: true }).then(() => resolve())
        })
      });
      it("Can refund transactions for member", async () => {
        await mock(mockRequests.transactions.get.ok([initTransaction], { memberId: customer.id }, true));
        await memberPO.goToMemberTransactions();
        await transactionsPO.selectRow(initTransaction.id);
        await utils.clickElement(transactionsPO.actionButtons.delete);
        await utils.waitForVisible(transactionsPO.refundTransactionModal.submit);
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.member)).toEqual(`${customer.firstname} ${customer.lastname}`);
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.amount)).toEqual(initTransaction.amount);
        await mock(mockRequests.transaction.delete.ok(initTransaction.id));
        await mock(mockRequests.transactions.get.ok([], { memberId: customer.id }, true));
        await utils.clickElement(transactionsPO.refundTransactionModal.submit);
        await utils.waitForNotVisible(transactionsPO.refundTransactionModal.submit);
        await utils.waitForVisible(transactionsPO.getNoDataRowId());
      });
    });
  });
});
