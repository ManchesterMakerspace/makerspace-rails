import * as moment from "moment";
import { basicUser, adminUser } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";

import auth from "../pageObjects/auth";
import utils from "../pageObjects/common";
import memberPO from "../pageObjects/member";
import rentalsPO from "../pageObjects/rentals";
import renewPO from "../pageObjects/renewalForm";
import { Rental } from "app/entities/rental";
import { defaultRental } from "../constants/rental";

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
    const targetUrl = memberPO.getProfilePath(basicUser.id);
    const initRental = {
      ...defaultRental,
      memberId: basicUser.id,
      memberName: `${basicUser.firstname} ${basicUser.lastname}`,
    };
    beforeEach(async () => {
      // 1. Login as admin and nav to basic user's profile
      await mock(mockRequests.invoices.get.ok([], undefined));
      await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
      return auth.autoLogin(adminUser, targetUrl);
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
      await utils.waitForVisisble(rentalsPO.rentalForm.submit);
      expect(await utils.getElementText(rentalsPO.rentalForm.member)).toEqual(`${basicUser.firstname} ${basicUser.lastname}`);
      await utils.fillInput(rentalsPO.rentalForm.number, initRental.number);
      await utils.fillInput(rentalsPO.rentalForm.description, initRental.description);
      await utils.fillInput(rentalsPO.rentalForm.expiration, new Date(basicUser.expirationTime + (1000 * 60 * 60 * 24 * 30)).toDateString());
      await mock(mockRequests.rentals.post.ok(initRental));
      await utils.clickElement(rentalsPO.rentalForm.submit);
      await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
      await mock(mockRequests.rentals.get.ok([initRental], undefined, true));
      expect((await rentalsPO.getAllRows()).length).toEqual(1);
      const columns = await rentalsPO.getColumnIds(["number", "description", "member"], initRental.id);
      await Promise.all(Object.entries(columns).map(([fieldName, columnId]) => {
        return new Promise(async (resolve) => {
          expect(await utils.getElementText(columnId)).toEqual(initRental[fieldName]);
        });
      }));
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
      await utils.waitForVisisble(rentalsPO.rentalForm.submit);
      expect(await utils.getElementText(rentalsPO.rentalForm.member)).toEqual(`${basicUser.firstname} ${basicUser.lastname}`);
      await utils.fillInput(rentalsPO.rentalForm.number, updatedRental.number);
      await utils.fillInput(rentalsPO.rentalForm.description, updatedRental.description);
      await utils.fillInput(rentalsPO.rentalForm.expiration, new Date(updatedRental.expiration).toDateString());
      await mock(mockRequests.rentals.put.ok(updatedRental));
      await mock(mockRequests.rentals.get.ok([updatedRental], undefined, true));
      await utils.clickElement(rentalsPO.rentalForm.submit);
      await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
      expect((await rentalsPO.getAllRows()).length).toEqual(1);
      const columns = await rentalsPO.getColumnIds(["number", "description", "member"], updatedRental.id);
      await Promise.all(Object.entries(columns).map(([fieldName, columnId]) => {
        return new Promise(async (resolve) => {
          expect(await utils.getElementText(columnId)).toEqual(updatedRental[fieldName]);
          resolve();
        });
      }));
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
      await utils.waitForVisisble(rentalsPO.deleteRentalModal.submit);
      expect(await utils.getElementText(rentalsPO.deleteRentalModal.member)).toEqual(`${basicUser.firstname} ${basicUser.lastname}`);
      expect(await utils.getElementText(rentalsPO.deleteRentalModal.number)).toEqual(initRental.number);
      expect(await utils.getElementText(rentalsPO.deleteRentalModal.description)).toEqual(initRental.description);
      await mock(mockRequests.rentals.delete.ok(initRental.id));
      await mock(mockRequests.rentals.get.ok([], undefined, true));
      await utils.clickElement(rentalsPO.deleteRentalModal.submit);
      await utils.waitForNotVisible(rentalsPO.deleteRentalModal.submit);
      await utils.waitForVisisble(rentalsPO.getNoDataRowId());
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
      await utils.waitForVisisble(renewPO.renewalForm.submit);
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
      const columns = await rentalsPO.getColumnIds(["number", "description", "member"], updatedRental.id);
      await Promise.all(Object.entries(columns).map(([fieldName, columnId]) => {
        return new Promise(async (resolve) => {
          expect(await utils.getElementText(columnId)).toEqual(updatedRental[fieldName]);
          resolve();
        });
      }));
    });
  });
});