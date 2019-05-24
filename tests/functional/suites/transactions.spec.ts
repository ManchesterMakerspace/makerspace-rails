import { basicUser, adminUser } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";

import auth from "../pageObjects/auth";
import header from "../pageObjects/header";
import utils from "../pageObjects/common";
import memberPO from "../pageObjects/member";
import transactionsPO from "../pageObjects/transactions";
import { defaultTransaction, defaultTransactions } from "../constants/transaction";

describe("Transactions", () => {
  xdescribe("Basic user", () => {
    const initTransaction = {
      ...defaultTransaction,
      memberId: basicUser.id,
      memberName: `${basicUser.firstname} ${basicUser.lastname}`,
    };
    beforeEach(() => {
      return auth.autoLogin(basicUser, undefined, { billing: true });
    });
    it("Can review their transactions", async () => {
      await mock(mockRequests.transactions.get.ok(defaultTransactions));
      await memberPO.goToMemberTransactions();
      await utils.waitForPageLoad(transactionsPO.listUrl);
      expect(await utils.isElementDisplayed(transactionsPO.getErrorRowId())).toBeFalsy();
      expect(await utils.isElementDisplayed(transactionsPO.getNoDataRowId())).toBeFalsy();
      expect(await utils.isElementDisplayed(transactionsPO.getLoadingId())).toBeFalsy();
      expect(await utils.isElementDisplayed(transactionsPO.getTitleId())).toBeTruthy();
      await transactionsPO.verifyListView(defaultTransactions, transactionsPO.fieldEvaluator());
    });
    it("Can request refund for transactions for member", async () => {
      await mock(mockRequests.transactions.get.ok([initTransaction], { memberId: basicUser.id }, true));
      await memberPO.goToMemberTransactions();
      await transactionsPO.selectRow(initTransaction.id);
      await utils.clickElement(transactionsPO.actionButtons.delete);
      await utils.waitForVisible(transactionsPO.refundTransactionModal.submit);
      expect(await utils.getElementText(transactionsPO.refundTransactionModal.member)).toEqual(`${basicUser.firstname} ${basicUser.lastname}`);
      expect(await utils.getElementText(transactionsPO.refundTransactionModal.amount)).toEqual(initTransaction.amount);
      expect(await utils.getElementText(transactionsPO.refundTransactionModal.description)).toEqual(initTransaction.description);
      await mock(mockRequests.transaction.delete.ok(initTransaction.id));
      await mock(mockRequests.transactions.get.ok([], { memberId: basicUser.id }, true));
      await utils.clickElement(transactionsPO.refundTransactionModal.submit);
      await utils.waitForNotVisible(transactionsPO.refundTransactionModal.submit);
      await utils.waitForVisible(transactionsPO.getNoDataRowId());
    });
  });
  describe("Admin user", () => {
    describe("From list view", () => {
      beforeEach(async () => {
        return auth.autoLogin(adminUser, undefined, { billing: true }).then(async () => {
          await mock(mockRequests.transactions.get.ok(defaultTransactions, {}, true));
          await header.navigateTo(header.links.billing);
          // TODO: select transactions tab
          await utils.waitForPageLoad(transactionsPO.listUrl);
          expect(await utils.isElementDisplayed(transactionsPO.getErrorRowId())).toBeFalsy();
          expect(await utils.isElementDisplayed(transactionsPO.getNoDataRowId())).toBeFalsy();
          expect(await utils.isElementDisplayed(transactionsPO.getLoadingId())).toBeFalsy();
          expect(await utils.isElementDisplayed(transactionsPO.getTitleId())).toBeTruthy();
          expect(await transactionsPO.getColumnText("number", defaultTransactions[0].id)).toBeTruthy();
        });
      });
      it("Loads a list of transactions", async () => {
        await transactionsPO.verifyListView(defaultTransactions, transactionsPO.fieldEvaluator());
      });

      it("Can refund transactions for members", async () => {
        await transactionsPO.selectRow(defaultTransactions[0].id);
        await utils.clickElement(transactionsPO.transactionsList.deleteButton);
        await utils.waitForVisible(transactionsPO.refundTransactionModal.submit);
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.member)).toEqual(defaultTransactions[0].memberName);
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.amount)).toEqual(defaultTransactions[0].amount);
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.description)).toEqual(defaultTransactions[0].description);
        await mock(mockRequests.transaction.delete.ok(defaultTransactions[0].id, true));
        await mock(mockRequests.transactions.get.ok([], undefined, true));
        await utils.clickElement(transactionsPO.refundTransactionModal.submit);
        await utils.waitForNotVisible(transactionsPO.refundTransactionModal.submit);
        await utils.waitForVisible(transactionsPO.getNoDataRowId());
      });
    });

    describe("From a user's profile", () => {
      const targetUrl = memberPO.getProfilePath(basicUser.id);
      const initTransaction = {
        ...defaultTransaction,
        memberId: basicUser.id,
        memberName: `${basicUser.firstname} ${basicUser.lastname}`,
      };
      beforeEach(() => {
        return new Promise(async (resolve) => {
          // 1. Login as admin and nav to basic user's profile
          await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
          return auth.autoLogin(adminUser, targetUrl, { billing: true }).then(() => resolve())
        })
      });
      it("Can request refund for transactions for member", async () => {
        await mock(mockRequests.transactions.get.ok([initTransaction], { memberId: basicUser.id }, true));
        await memberPO.goToMemberTransactions();
        await transactionsPO.selectRow(initTransaction.id);
        await utils.clickElement(transactionsPO.actionButtons.delete);
        await utils.waitForVisible(transactionsPO.refundTransactionModal.submit);
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.member)).toEqual(`${basicUser.firstname} ${basicUser.lastname}`);
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.amount)).toEqual(initTransaction.amount);
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.description)).toEqual(initTransaction.description);
        await mock(mockRequests.transaction.delete.ok(initTransaction.id));
        await mock(mockRequests.transactions.get.ok([], { memberId: basicUser.id }, true));
        await utils.clickElement(transactionsPO.refundTransactionModal.submit);
        await utils.waitForNotVisible(transactionsPO.refundTransactionModal.submit);
        await utils.waitForVisible(transactionsPO.getNoDataRowId());
      });
    });
  });
});
