import * as moment from "moment";
import { basicUser, adminUser } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";

import auth from "../pageObjects/auth";
import utils from "../pageObjects/common";
import memberPO from "../pageObjects/member";
import rentalsPO from "../pageObjects/rentals";
import renewPO from "../pageObjects/renewalForm";
import { Rental } from "app/entities/rental";

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
    beforeEach(async () => {
      // 1. Login as admin and nav to basic user's profile
      await mock(mockRequests.invoices.get.ok([]));
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
     const rentalToCreate = {
       id: "1",
       number: "12",
       description: "foo",
       expiration: 700007070,
       memberId: basicUser.id,
     }
      await mock(mockRequests.rentals.get.ok([]));
      await memberPO.goToMemberRentals();
      await utils.clickElement(rentalsPO.actionButtons.create);
      await utils.waitForVisisble(rentalsPO.rentalForm.submit);
      expect(await utils.getElementAttribute(rentalsPO.rentalForm.member, "value")).toEqual(`${basicUser.firstname} ${basicUser.lastname}`);
      await utils.fillInput(rentalsPO.rentalForm.number, rentalToCreate.number);
      await utils.fillInput(rentalsPO.rentalForm.description, rentalToCreate.description);
      await utils.fillInput(rentalsPO.rentalForm.expiration, new Date(rentalToCreate.expiration).toDateString());
      await mock(mockRequests.rentals.post.ok(rentalToCreate));
      await utils.clickElement(rentalsPO.rentalForm.submit);
      await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
      await mock(mockRequests.rentals.get.ok([rentalToCreate]));
      expect((await rentalsPO.getAllRows()).length).toEqual(1);
      const columns = await rentalsPO.getColumnIds(["number", "description", "member"], rentalToCreate.id);
      Object.entries(columns).forEach(async ([fieldName, columnId]) => {
        expect(await utils.getElementText(columnId)).toEqual(rentalToCreate[fieldName]);
      });
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
     const initRental = {
       id: "1",
       number: "12",
       description: "foo",
       expiration: 700007070,
       memberId: basicUser.id,
     };
     const updatedRental = {
       id: "1",
       number: "12",
       description: "foo",
       expiration: 700007070,
       memberId: basicUser.id,
     }
      await mock(mockRequests.rentals.get.ok([initRental]));
      await memberPO.goToMemberRentals();
      await rentalsPO.selectRow(initRental.id);
      await utils.clickElement(rentalsPO.actionButtons.edit);
      await utils.waitForVisisble(rentalsPO.rentalForm.submit);
      expect(await utils.getElementAttribute(rentalsPO.rentalForm.member, "value")).toEqual(`${basicUser.firstname} ${basicUser.lastname}`);
      await utils.fillInput(rentalsPO.rentalForm.number, updatedRental.number);
      await utils.fillInput(rentalsPO.rentalForm.description, updatedRental.description);
      await utils.fillInput(rentalsPO.rentalForm.expiration, new Date(updatedRental.expiration).toDateString());
      await mock(mockRequests.rentals.put.ok(updatedRental));
      await mock(mockRequests.rentals.get.ok([updatedRental]));
      await utils.clickElement(rentalsPO.rentalForm.submit);
      await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
      expect((await rentalsPO.getAllRows()).length).toEqual(1);
      const columns = await rentalsPO.getColumnIds(["number", "description", "member"], updatedRental.id);
      Object.entries(columns).forEach(async ([fieldName, columnId]) => {
        expect(await utils.getElementText(columnId)).toEqual(updatedRental[fieldName]);
      });
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
      const initRental = {
        id: "1",
        number: "12",
        description: "foo",
        expiration: 700007070,
        memberId: basicUser.id,
      };
      await mock(mockRequests.rentals.get.ok([initRental]));
      await memberPO.goToMemberRentals();
      await rentalsPO.selectRow(initRental.id);
      await utils.clickElement(rentalsPO.actionButtons.delete);
      await utils.waitForVisisble(rentalsPO.deleteRentalModal.submit);
      expect(await utils.getElementText(rentalsPO.deleteRentalModal.member)).toEqual(`${basicUser.firstname} ${basicUser.lastname}`);
      expect(await utils.getElementText(rentalsPO.deleteRentalModal.number)).toEqual(initRental.number);
      expect(await utils.getElementText(rentalsPO.deleteRentalModal.description)).toEqual(initRental.description);
      await mock(mockRequests.rentals.delete.ok(initRental.id));
      await mock(mockRequests.rentals.get.ok([]));
      await utils.clickElement(rentalsPO.deleteRentalModal.submit);
      await utils.waitForNotVisible(rentalsPO.deleteRentalModal.submit);
      expect((await rentalsPO.getAllRows()).length).toEqual(0);
    });
    it("Can renew rentals for members", async () => {
      const initRental = {
        id: "1",
        number: "12",
        description: "foo",
        expiration: 700007070,
        memberId: basicUser.id,
      };
      const updatedRental: Partial<Rental> = {
        ...initRental,
        expiration: moment(initRental.expiration).add(1, 'M').valueOf()
      }
      await mock(mockRequests.rentals.get.ok([initRental]));
      await memberPO.goToMemberRentals();
      await rentalsPO.selectRow(initRental.id);
      await utils.clickElement(rentalsPO.actionButtons.renew);
      await utils.waitForVisisble(renewPO.renewalForm.submit);
      expect(await utils.getElementText(renewPO.renewalForm.entity)).toEqual(initRental.number);
      await utils.clickElement(renewPO.renewalForm.submit);
      expect(await utils.isElementDisplayed(renewPO.renewalForm.error)).toBeTruthy();
      await utils.selectDropdownByValue(renewPO.renewalForm.renewalSelect, "1");
      expect(await utils.isElementDisplayed(renewPO.renewalForm.error)).toBeFalsy();
      await utils.clickElement(renewPO.renewalForm.submit);
      await mock(mockRequests.rentals.put.ok(updatedRental));
      await mock(mockRequests.rentals.get.ok([updatedRental]));
      await utils.waitForNotVisible(renewPO.renewalForm.submit);
      expect((await rentalsPO.getAllRows()).length).toEqual(1);
      const columns = await rentalsPO.getColumnIds(["number", "description", "member"], updatedRental.id);
      Object.entries(columns).forEach(async ([fieldName, columnId]) => {
        expect(await utils.getElementText(columnId)).toEqual(updatedRental[fieldName]);
      });
    });
  });
});