import { expect } from "chai";
import moment from "moment";
import { basicUser, adminUser, defaultMembers } from "../../constants/member";

import header from "../../pageObjects/header";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import rentalsPO from "../../pageObjects/rentals";
import renewPO from "../../pageObjects/renewalForm";
import { Rental, updateRental } from "makerspace-ts-api-client";
import { defaultRental, defaultRentals } from "../../constants/rental";
import { autoLogin } from "../autoLogin";
import { loadMockserver } from "../mockserver";
const mocker = loadMockserver();

describe("Rentals", () => {
  // TODO: These features don't exist yet
  xdescribe("Basic user", () => {
    beforeEach(() => {
      return autoLogin(mocker, basicUser);
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
        mocker.adminListRentals_200({}, defaultRentals);
        return autoLogin(mocker, adminUser, undefined, { billing: true }).then(async () => {
          await header.navigateTo(header.links.rentals);
          await utils.waitForPageLoad(rentalsPO.listUrl);
          expect(await utils.isElementDisplayed(rentalsPO.getErrorRowId())).to.be.false;
          expect(await utils.isElementDisplayed(rentalsPO.getNoDataRowId())).to.be.false;
          expect(await utils.isElementDisplayed(rentalsPO.getLoadingId())).to.be.false;
          expect(await utils.isElementDisplayed(rentalsPO.getTitleId())).to.be.true;
          expect(!!(await rentalsPO.getColumnText("number", defaultRentals[0].id))).to.be.true;
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
        await utils.fillInput(rentalsPO.rentalForm.notes, "some random notes for this member");
        await utils.clickElement(rentalsPO.rentalForm.contract);
        mocker.listMembers_200({}, defaultMembers);
        await utils.fillAsyncSearchInput(
          rentalsPO.rentalForm.member,
          defaultMembers[0].email,
          `${defaultMembers[0].firstname} ${defaultMembers[0].lastname}`
        );
        // TODO: Notes should be possible and expiration not required for this payload
        mocker.adminCreateRental_200({ body: {
          memberId: defaultMembers[0].id,
          number: initRental.number, 
          description: initRental.description,
          contractOnFile: true,
        } as any }, initRental);
        mocker.adminListRentals_200({}, [initRental]);
        await utils.clickElement(rentalsPO.rentalForm.submit);
        await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
        expect((await rentalsPO.getAllRows()).length).to.eql(1);
        await rentalsPO.verifyFields(initRental, rentalsPO.fieldEvaluator(basicUser));
      });

      it("Can edit rentals for members", async () => {
        const expiration = new Date(moment(defaultRentals[0].expiration).add(2, 'M').valueOf());
        expiration.setHours(0,0,0,0);

        const updatedRental = {
          ...defaultRentals[0],
          number: "11",
          description: "bar",
          expiration: expiration.valueOf()
        }
        await rentalsPO.selectRow(defaultRentals[0].id);
        await utils.clickElement(rentalsPO.rentalsList.editButton);
        await utils.waitForVisible(rentalsPO.rentalForm.submit);

        await utils.fillInput(rentalsPO.rentalForm.number, updatedRental.number);
        await utils.fillInput(rentalsPO.rentalForm.description, updatedRental.description);
        await utils.fillInput(rentalsPO.rentalForm.notes, "some random notes for this member");
        await utils.inputTime(rentalsPO.rentalForm.expiration, updatedRental.expiration);
        mocker.adminUpdateRental_200({ id: updatedRental.id, body: {
          number: updatedRental.number,
          description: updatedRental.description,
          notes: "some random notes for this member",
          expiration: utils.timeValue(updatedRental.expiration)
        } as any}, updatedRental);
        mocker.adminListRentals_200({}, [updatedRental]);
        await utils.clickElement(rentalsPO.rentalForm.submit);
        await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
        expect((await rentalsPO.getAllRows()).length).to.eql(1);
        await rentalsPO.verifyFields(updatedRental, rentalsPO.fieldEvaluator());
      });

      it("Can delete rentals for members", async () => {
        await rentalsPO.selectRow(defaultRentals[0].id);
        await utils.clickElement(rentalsPO.rentalsList.deleteButton);
        await utils.waitForVisible(rentalsPO.deleteRentalModal.submit);
        expect(await utils.getElementText(rentalsPO.deleteRentalModal.member)).to.eql(defaultRentals[0].memberName);
        expect(await utils.getElementText(rentalsPO.deleteRentalModal.number)).to.eql(defaultRentals[0].number);
        expect(await utils.getElementText(rentalsPO.deleteRentalModal.description)).to.eql(defaultRentals[0].description);
        mocker.adminDeleteRental_204({ id: defaultRentals[0].id });
        mocker.adminListRentals_200({}, []);
        await utils.clickElement(rentalsPO.deleteRentalModal.submit);
        await utils.waitForNotVisible(rentalsPO.deleteRentalModal.submit);
        await utils.waitForVisible(rentalsPO.getNoDataRowId());
      });

      it("Can renew rentals for members", async () => {
        const updatedRental: Rental = {
          ...defaultRentals[0],
          expiration: moment(defaultRentals[0].expiration).add(1, 'M').valueOf()
        }
        await rentalsPO.selectRow(defaultRentals[0].id);
        await utils.clickElement(rentalsPO.rentalsList.renewButton);
        await utils.waitForVisible(renewPO.renewalForm.submit);
        expect(await utils.getElementText(renewPO.renewalForm.entity)).to.eql(defaultRentals[0].number);
        await utils.clickElement(renewPO.renewalForm.submit);
        await utils.assertInputError(renewPO.renewalForm.termError, true);
        await utils.selectDropdownByValue(renewPO.renewalForm.renewalSelect, "1");
        await utils.assertNoInputError(renewPO.renewalForm.termError, true);
        // TODO Update rental doesn't support renew
        mocker.adminUpdateRental_200({ id: updatedRental.id, body: { renew: 1 } as any }, updatedRental);
        mocker.adminListRentals_200({}, [updatedRental]);
        await utils.clickElement(renewPO.renewalForm.submit);
        await utils.waitForNotVisible(renewPO.renewalForm.submit);
        expect((await rentalsPO.getAllRows()).length).to.eql(1);
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
          mocker.listInvoices_200({}, []);
          mocker.getMember_200({ id: basicUser.id }, basicUser);
          return autoLogin(mocker, adminUser, targetUrl, { billing: true }).then(() => resolve())
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
        mocker.adminListRentals_200({}, []);
        await memberPO.goToMemberRentals();
        await utils.clickElement(rentalsPO.actionButtons.create);
        await utils.waitForVisible(rentalsPO.rentalForm.submit);
        expect(await utils.getElementText(rentalsPO.rentalForm.member)).to.eql(`${basicUser.firstname} ${basicUser.lastname}`);
        await utils.fillInput(rentalsPO.rentalForm.number, initRental.number);
        await utils.fillInput(rentalsPO.rentalForm.description, initRental.description);
        await utils.clickElement(rentalsPO.rentalForm.contract);

        mocker.adminCreateRental_200({ body: {
          number: initRental.number,
          memberId: basicUser.id,
          description: initRental.description,
          contractOnFile: true
        } as any }, initRental);
        mocker.adminListRentals_200({}, [initRental]);
        await utils.clickElement(rentalsPO.rentalForm.submit);
        await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
        expect((await rentalsPO.getAllRows()).length).to.eql(1);
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
        const expiration = new Date(moment(defaultRentals[0].expiration).add(2, 'M').valueOf());
        expiration.setHours(0,0,0,0);

        const updatedRental = {
          ...initRental,
          number: "11",
          description: "bar",
          expiration: expiration.valueOf()
        }
        mocker.adminListRentals_200({}, [initRental]);
        await memberPO.goToMemberRentals();
        await rentalsPO.selectRow(initRental.id);
        await utils.clickElement(rentalsPO.actionButtons.edit);
        await utils.waitForVisible(rentalsPO.rentalForm.submit);
        expect(await utils.getElementText(rentalsPO.rentalForm.member)).to.eql(`${basicUser.firstname} ${basicUser.lastname}`);
        await utils.fillInput(rentalsPO.rentalForm.number, updatedRental.number);
        await utils.fillInput(rentalsPO.rentalForm.description, updatedRental.description);
        await utils.inputTime(rentalsPO.rentalForm.expiration, updatedRental.expiration);
        mocker.adminUpdateRental_200({ id: updatedRental.id, body: {
          number: updatedRental.number,
          description: updatedRental.description,
          expiration: utils.timeValue(updatedRental.expiration)
        } as any}, updatedRental);
        mocker.adminListRentals_200({}, [updatedRental]);
        await utils.clickElement(rentalsPO.rentalForm.submit);
        await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
        expect((await rentalsPO.getAllRows()).length).to.eql(1);
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
        mocker.adminListRentals_200({}, [initRental]);
        await memberPO.goToMemberRentals();
        await rentalsPO.selectRow(initRental.id);
        await utils.clickElement(rentalsPO.actionButtons.delete);
        await utils.waitForVisible(rentalsPO.deleteRentalModal.submit);
        expect(await utils.getElementText(rentalsPO.deleteRentalModal.member)).to.eql(`${basicUser.firstname} ${basicUser.lastname}`);
        expect(await utils.getElementText(rentalsPO.deleteRentalModal.number)).to.eql(initRental.number);
        expect(await utils.getElementText(rentalsPO.deleteRentalModal.description)).to.eql(initRental.description);
        mocker.adminDeleteRental_204({ id: initRental.id });
        mocker.adminListRentals_200({}, []);
        await utils.clickElement(rentalsPO.deleteRentalModal.submit);
        await utils.waitForNotVisible(rentalsPO.deleteRentalModal.submit);
        await utils.waitForVisible(rentalsPO.getNoDataRowId());
      });

      it("Can renew rentals for members", async () => {
        const updatedRental: Rental = {
          ...initRental,
          expiration: moment(initRental.expiration).add(1, 'M').valueOf()
        }
        mocker.adminListRentals_200({}, [initRental]);
        await memberPO.goToMemberRentals();
        await rentalsPO.selectRow(initRental.id);
        await utils.clickElement(rentalsPO.actionButtons.renew);
        await utils.waitForVisible(renewPO.renewalForm.submit);
        expect(await utils.getElementText(renewPO.renewalForm.entity)).to.eql(initRental.number);
        await utils.clickElement(renewPO.renewalForm.submit);
        await utils.assertInputError(renewPO.renewalForm.termError, true);
        await utils.selectDropdownByValue(renewPO.renewalForm.renewalSelect, "1");
        await utils.assertNoInputError(renewPO.renewalForm.termError, true);
        mocker.adminUpdateRental_200({ id: updatedRental.id, body: { renew: 1 } as any }, updatedRental);
        mocker.adminListRentals_200({}, [updatedRental]);
        await utils.clickElement(renewPO.renewalForm.submit);
        await utils.waitForNotVisible(renewPO.renewalForm.submit);
        expect((await rentalsPO.getAllRows()).length).to.eql(1);
        await rentalsPO.verifyFields(updatedRental, rentalsPO.fieldEvaluator(basicUser));
      });
    });
  });
});
