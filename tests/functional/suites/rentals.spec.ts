import * as moment from "moment";
import { basicUser, adminUser } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";

import auth from "../pageObjects/auth";
import header from "../pageObjects/header";
import utils from "../pageObjects/common";
import memberPO from "../pageObjects/member";
import rentalsPO from "../pageObjects/rentals";
import renewPO from "../pageObjects/renewalForm";
import { Rental } from "app/entities/rental";
import { defaultRental, defaultRentals } from "../constants/rental";

describe("Rentals", () => {
  xdescribe("Basic user", () => {
    beforeEach(() => {
      return auth.autoLogin(basicUser);
    });
    it("Can review and pay for their rentals", () => {

    });
    it("Can request for a new rental", () => {

    });
  });
  describe("Admin user", () => {
    describe("From list view", () => {
      const initRental = {
        ...defaultRental,
        memberId: basicUser.id,
        memberName: `${basicUser.firstname} ${basicUser.lastname}`,
      };
      beforeEach(async () => {
        return auth.autoLogin(adminUser, undefined, { billing: true }).then(async () => {
          await mock(mockRequests.rentals.get.ok(defaultRentals, {}, true));
          await header.navigateTo(header.links.rentals);
          await utils.waitForPageLoad(rentalsPO.listUrl);
          expect(await utils.isElementDisplayed(rentalsPO.getErrorRowId())).toBeFalsy();
          expect(await utils.isElementDisplayed(rentalsPO.getNoDataRowId())).toBeFalsy();
          expect(await utils.isElementDisplayed(rentalsPO.getLoadingId())).toBeFalsy();
          expect(await utils.isElementDisplayed(rentalsPO.getTitleId())).toBeTruthy();
          expect(await rentalsPO.getColumnText("number", defaultRentals[0].id)).toBeTruthy();
        });
      });
      it("Loads a list of rentals", async () => {
        await rentalsPO.verifyListView(defaultRentals, rentalsPO.fieldEvaluator());
      });
      it("Can create new rentals for members", async () => {
        await utils.clickElement(rentalsPO.rentalsList.createButton);
        await utils.waitForVisible(rentalsPO.rentalForm.submit);
        await utils.fillInput(rentalsPO.rentalForm.number, initRental.number);
        await utils.fillInput(rentalsPO.rentalForm.description, initRental.description);

        await mock(mockRequests.rentals.post.ok(initRental));
        await mock(mockRequests.rentals.get.ok([initRental], undefined, true));
        await utils.clickElement(rentalsPO.rentalForm.submit);
        await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
        expect((await rentalsPO.getAllRows()).length).toEqual(1);
        await rentalsPO.verifyFields(initRental, rentalsPO.fieldEvaluator(basicUser));
      });

      it("Can edit rentals for members", async () => {
        const updatedRental = {
          ...defaultRentals[0],
          number: "11",
          description: "bar",
          expiration: moment(defaultRentals[0].expiration).add(2, 'M').valueOf()
        }
        await rentalsPO.selectRow(defaultRentals[0].id);
        await utils.clickElement(rentalsPO.rentalsList.editButton);
        await utils.waitForVisible(rentalsPO.rentalForm.submit);

        await utils.fillInput(rentalsPO.rentalForm.number, updatedRental.number);
        await utils.fillInput(rentalsPO.rentalForm.description, updatedRental.description);
        await utils.inputTime(rentalsPO.rentalForm.expiration, updatedRental.expiration);
        await mock(mockRequests.rentals.put.ok(updatedRental));
        await mock(mockRequests.rentals.get.ok([updatedRental], undefined, true));
        await utils.clickElement(rentalsPO.rentalForm.submit);
        await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
        expect((await rentalsPO.getAllRows()).length).toEqual(1);
        await rentalsPO.verifyFields(updatedRental, rentalsPO.fieldEvaluator());
      });

      it("Can delete rentals for members", async () => {
        await rentalsPO.selectRow(defaultRentals[0].id);
        await utils.clickElement(rentalsPO.rentalsList.deleteButton);
        await utils.waitForVisible(rentalsPO.deleteRentalModal.submit);
        expect(await utils.getElementText(rentalsPO.deleteRentalModal.member)).toEqual(defaultRentals[0].memberName);
        expect(await utils.getElementText(rentalsPO.deleteRentalModal.number)).toEqual(defaultRentals[0].number);
        expect(await utils.getElementText(rentalsPO.deleteRentalModal.description)).toEqual(defaultRentals[0].description);
        await mock(mockRequests.rentals.delete.ok(defaultRentals[0].id));
        await mock(mockRequests.rentals.get.ok([], undefined, true));
        await utils.clickElement(rentalsPO.deleteRentalModal.submit);
        await utils.waitForNotVisible(rentalsPO.deleteRentalModal.submit);
        await utils.waitForVisible(rentalsPO.getNoDataRowId());
      });

      it("Can renew rentals for members", async () => {
        const updatedRental: Partial<Rental> = {
          ...defaultRentals[0],
          expiration: moment(defaultRentals[0].expiration).add(1, 'M').valueOf()
        }
        await rentalsPO.selectRow(defaultRentals[0].id);
        await utils.clickElement(rentalsPO.rentalsList.renewButton);
        await utils.waitForVisible(renewPO.renewalForm.submit);
        expect(await utils.getElementText(renewPO.renewalForm.entity)).toEqual(defaultRentals[0].number);
        await utils.clickElement(renewPO.renewalForm.submit);
        await utils.assertInputError(renewPO.renewalForm.termError, true);
        await utils.selectDropdownByValue(renewPO.renewalForm.renewalSelect, "1");
        await utils.assertNoInputError(renewPO.renewalForm.termError, true);
        await mock(mockRequests.rentals.put.ok(updatedRental));
        await mock(mockRequests.rentals.get.ok([updatedRental], undefined, true));
        await utils.clickElement(renewPO.renewalForm.submit);
        await utils.waitForNotVisible(renewPO.renewalForm.submit);
        expect((await rentalsPO.getAllRows()).length).toEqual(1);
        await rentalsPO.verifyFields(updatedRental, rentalsPO.fieldEvaluator());
      });

      it("Rental Form Validation", async () => {

      });
    });

    describe("From a user's profile", () => {
      const targetUrl = memberPO.getProfilePath(basicUser.id);
      const initRental = {
        ...defaultRental,
        memberId: basicUser.id,
        memberName: `${basicUser.firstname} ${basicUser.lastname}`,
      };
      beforeEach(() => {
        return new Promise(async (resolve) => {
          // 1. Login as admin and nav to basic user's profile
          await mock(mockRequests.invoices.get.ok([], undefined));
          await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
          return auth.autoLogin(adminUser, targetUrl, { billing: true }).then(() => resolve())
        })
      });
      it("Can create new rentals for members", async () => {
        /* 1. Login as admin and nav to basic user's profile
           2. Setup mocks
            - Load rentals (0 results)
            - Create rental
            - Load rentals (1 result)
           3. Click 'Create Rental' button
           4. Fill out form & submit
           5. Assert new rental loaded in profile page
        */
        await mock(mockRequests.rentals.get.ok([], undefined, true));
        await memberPO.goToMemberRentals();
        await utils.clickElement(rentalsPO.actionButtons.create);
        await utils.waitForVisible(rentalsPO.rentalForm.submit);
        expect(await utils.getElementText(rentalsPO.rentalForm.member)).toEqual(`${basicUser.firstname} ${basicUser.lastname}`);
        await utils.fillInput(rentalsPO.rentalForm.number, initRental.number);
        await utils.fillInput(rentalsPO.rentalForm.description, initRental.description);

        await mock(mockRequests.rentals.post.ok(initRental));
        await mock(mockRequests.rentals.get.ok([initRental], undefined, true));
        await utils.clickElement(rentalsPO.rentalForm.submit);
        await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
        expect((await rentalsPO.getAllRows()).length).toEqual(1);
        await rentalsPO.verifyFields(initRental, rentalsPO.fieldEvaluator(basicUser));
      });

      it("Can edit rentals for members", async () => {
        /* 1. Login as admin and nav to basic user's profile
           2. Setup mocks
            - Load rentals (1 result)
            - Edit rental
            - Load rentals (1 result)
           3. Click 'Edit Rental' button
           4. Fill out form & submit
           5. Assert updated rental loaded in profile page
        */
        const updatedRental = {
          ...initRental,
          number: "11",
          description: "bar",
          expiration: moment(initRental.expiration).add(2, 'M').valueOf()
        }
        await mock(mockRequests.rentals.get.ok([initRental], undefined, true));
        await memberPO.goToMemberRentals();
        await rentalsPO.selectRow(initRental.id);
        await utils.clickElement(rentalsPO.actionButtons.edit);
        await utils.waitForVisible(rentalsPO.rentalForm.submit);
        expect(await utils.getElementText(rentalsPO.rentalForm.member)).toEqual(`${basicUser.firstname} ${basicUser.lastname}`);
        await utils.fillInput(rentalsPO.rentalForm.number, updatedRental.number);
        await utils.fillInput(rentalsPO.rentalForm.description, updatedRental.description);
        await utils.inputTime(rentalsPO.rentalForm.expiration, updatedRental.expiration);
        await mock(mockRequests.rentals.put.ok(updatedRental));
        await mock(mockRequests.rentals.get.ok([updatedRental], undefined, true));
        await utils.clickElement(rentalsPO.rentalForm.submit);
        await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
        expect((await rentalsPO.getAllRows()).length).toEqual(1);
        await rentalsPO.verifyFields(updatedRental, rentalsPO.fieldEvaluator(basicUser));
      });

      it("Can delete rentals for members", async () => {
        /* 1. Login as admin and nav to basic user's profile
           2. Setup mocks
            - Load rentals (1 result)
            - Delete rental
            - Load rentals (0 result)
           3. Click 'Delete Rental' button
           4. Confirm modal
           5. Assert rental not loaded in profile page
        */
        await mock(mockRequests.rentals.get.ok([initRental], undefined, true));
        await memberPO.goToMemberRentals();
        await rentalsPO.selectRow(initRental.id);
        await utils.clickElement(rentalsPO.actionButtons.delete);
        await utils.waitForVisible(rentalsPO.deleteRentalModal.submit);
        expect(await utils.getElementText(rentalsPO.deleteRentalModal.member)).toEqual(`${basicUser.firstname} ${basicUser.lastname}`);
        expect(await utils.getElementText(rentalsPO.deleteRentalModal.number)).toEqual(initRental.number);
        expect(await utils.getElementText(rentalsPO.deleteRentalModal.description)).toEqual(initRental.description);
        await mock(mockRequests.rentals.delete.ok(initRental.id));
        await mock(mockRequests.rentals.get.ok([], undefined, true));
        await utils.clickElement(rentalsPO.deleteRentalModal.submit);
        await utils.waitForNotVisible(rentalsPO.deleteRentalModal.submit);
        await utils.waitForVisible(rentalsPO.getNoDataRowId());
      });

      it("Can renew rentals for members", async () => {
        const updatedRental: Partial<Rental> = {
          ...initRental,
          expiration: moment(initRental.expiration).add(1, 'M').valueOf()
        }
        await mock(mockRequests.rentals.get.ok([initRental], undefined, true));
        await memberPO.goToMemberRentals();
        await rentalsPO.selectRow(initRental.id);
        await utils.clickElement(rentalsPO.actionButtons.renew);
        await utils.waitForVisible(renewPO.renewalForm.submit);
        expect(await utils.getElementText(renewPO.renewalForm.entity)).toEqual(initRental.number);
        await utils.clickElement(renewPO.renewalForm.submit);
        await utils.assertInputError(renewPO.renewalForm.termError, true);
        await utils.selectDropdownByValue(renewPO.renewalForm.renewalSelect, "1");
        await utils.assertNoInputError(renewPO.renewalForm.termError, true);
        await mock(mockRequests.rentals.put.ok(updatedRental));
        await mock(mockRequests.rentals.get.ok([updatedRental], undefined, true));
        await utils.clickElement(renewPO.renewalForm.submit);
        await utils.waitForNotVisible(renewPO.renewalForm.submit);
        expect((await rentalsPO.getAllRows()).length).toEqual(1);
        await rentalsPO.verifyFields(updatedRental, rentalsPO.fieldEvaluator(basicUser));
      });
    });
  });
});
