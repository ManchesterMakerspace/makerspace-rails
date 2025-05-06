import { expect } from "chai";
import { basicUser, adminUser } from "../../constants/member";

import header from "../../pageObjects/header";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import transactionsPO from "../../pageObjects/transactions";
import billingPO from "../../pageObjects/billing";
import { defaultTransaction, defaultTransactions } from "../../constants/transaction";
import { timeToDate } from "ui/utils/timeToDate";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { autoLogin } from "../autoLogin";
import { loadMockserver } from "../mockserver";
const mocker = loadMockserver();

describe("Transactions", () => {
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
      return autoLogin(mocker, customer, undefined, { billing: true });
    });
    it("Can review their transactions", async () => {
      mocker.listTransactions_200({}, defaultTransactions);
      await memberPO.goToMemberTransactions();
      await utils.waitForVisible(transactionsPO.getTitleId());
      expect(await utils.isElementDisplayed(transactionsPO.getErrorRowId())).to.be.false;
      expect(await utils.isElementDisplayed(transactionsPO.getNoDataRowId())).to.be.false;
      expect(await utils.isElementDisplayed(transactionsPO.getLoadingId())).to.be.false;
      expect(await utils.isElementDisplayed(transactionsPO.getTitleId())).to.be.true;
      await transactionsPO.verifyListView(defaultTransactions, transactionsPO.fieldEvaluator());
    });
    it("Can request refund for transactions", async () => {
      mocker.listTransactions_200({}, [initTransaction]);
      await memberPO.goToMemberTransactions();
      await utils.waitForVisible(transactionsPO.getTitleId());
      await transactionsPO.selectRow(initTransaction.id);
      await utils.clickElement(transactionsPO.actionButtons.delete);
      await utils.waitForVisible(transactionsPO.refundTransactionModal.submit);
      expect(await utils.getElementText(transactionsPO.refundTransactionModal.date)).to.eql(timeToDate(initTransaction.createdAt));
      expect(await utils.getElementText(transactionsPO.refundTransactionModal.amount)).to.eql(numberAsCurrency(initTransaction.amount));
      mocker.deleteTransaction_204({ id: initTransaction.id });
      mocker.listTransactions_200({}, []);
      await utils.clickElement(transactionsPO.refundTransactionModal.submit);
      await utils.waitForNotVisible(transactionsPO.refundTransactionModal.submit);
      await utils.waitForVisible(transactionsPO.getNoDataRowId());
    });
  });
  describe("Admin user", () => {
    describe("From list view", () => {
      beforeEach(async () => {
        return autoLogin(mocker, adminUser, undefined, { billing: true }).then(async () => {
          mocker.adminListTransaction_200({}, defaultTransactions);
          await header.navigateTo(header.links.billing);
          await utils.waitForPageLoad(billingPO.url);
          await billingPO.goToTransactions();
          expect(await utils.isElementDisplayed(transactionsPO.getErrorRowId())).to.be.false;
          expect(await utils.isElementDisplayed(transactionsPO.getNoDataRowId())).to.be.false;
          expect(await utils.isElementDisplayed(transactionsPO.getLoadingId())).to.be.false;
          expect(await utils.isElementDisplayed(transactionsPO.getTitleId())).to.be.true;
        });
      });
      it("Loads a list of transactions", async () => {
        await transactionsPO.verifyListView(defaultTransactions, transactionsPO.fieldEvaluator());
      });

      it("Can refund transactions for members", async () => {
        await transactionsPO.selectRow(defaultTransactions[0].id);
        await utils.clickElement(transactionsPO.transactionsList.deleteButton);
        await utils.waitForVisible(transactionsPO.refundTransactionModal.submit);
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.date)).to.eql(timeToDate(defaultTransactions[0].createdAt));
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.amount)).to.eql(numberAsCurrency(defaultTransactions[0].amount));
        mocker.adminDeleteTransaction_204({ id: defaultTransactions[0].id });
        mocker.adminListTransaction_200({}, []);
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
          mocker.getMember_200({ id: customer.id }, customer);
          return autoLogin(mocker, adminUser, targetUrl, { billing: true }).then(() => resolve())
        })
      });
      it("Can refund transactions for member", async () => {
        mocker.adminListTransaction_200({ customerId: customer.customerId }, [initTransaction]);
        await memberPO.goToMemberTransactions();
        await transactionsPO.selectRow(initTransaction.id);
        await utils.clickElement(transactionsPO.actionButtons.delete);
        await utils.waitForVisible(transactionsPO.refundTransactionModal.submit);
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.member)).to.eql(`${customer.firstname} ${customer.lastname}`);
        expect(await utils.getElementText(transactionsPO.refundTransactionModal.amount)).to.eql(numberAsCurrency(initTransaction.amount));
        mocker.adminDeleteTransaction_204({ id: initTransaction.id });
        mocker.adminListTransaction_200({ customerId: customer.customerId }, []);
        await utils.clickElement(transactionsPO.refundTransactionModal.submit);
        await utils.waitForNotVisible(transactionsPO.refundTransactionModal.submit);
        await utils.waitForVisible(transactionsPO.getNoDataRowId());
      });
    });
  });
});
