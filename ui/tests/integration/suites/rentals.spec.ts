import { expect } from "chai";
import moment from "moment";
import auth from "../../pageObjects/auth";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import header from "../../pageObjects/header";
import rentalsPO from "../../pageObjects/rentals";
import memberPo from "../../pageObjects/member";
import renewPO from "../../pageObjects/renewalForm";
import { Routing } from "app/constants";
import { getAdminUserLogin, getBasicUserLogin } from "../../constants/api_seed_data";
import { defaultRentals } from "../../constants/rental";

const newRental = {
  ...defaultRentals.pop(),
  number: "integration-test",
};

describe("Rentals", () => {
  beforeEach(() => {
    return browser.deleteAllCookies();
  });
  
  it("Admins can CRUD rentals", async () => {
    // Login
    await auth.goToLogin();
    await auth.signInUser(getAdminUserLogin());

    // Go to a member profile
    await header.navigateTo(header.links.members);
    await utils.waitForPageLoad(memberPo.membersListUrl);
    await utils.waitForNotVisible(memberPo.membersList.loading);
    await utils.fillSearchInput(memberPo.membersList.searchInput, getBasicUserLogin().email);
    await utils.waitForNotVisible(memberPo.membersList.loading);
    const link = await memberPO.getColumnByIndex(0, "lastname");
    const memberName: string = await link.getText();
    await (await link.$("a")).click();
    await utils.waitForPageToMatch(Routing.Profile);
    await utils.waitForNotVisible(memberPO.memberDetail.loading);

    // Create a rental
    await memberPO.goToMemberRentals();
    await utils.waitForVisible(rentalsPO.actionButtons.create);
    await utils.clickElement(rentalsPO.actionButtons.create);
    await utils.waitForVisible(rentalsPO.rentalForm.submit);
    expect(await utils.getElementText(rentalsPO.rentalForm.member)).to.eql(memberName);
    await utils.fillInput(rentalsPO.rentalForm.number, newRental.number);
    await utils.fillInput(rentalsPO.rentalForm.description, newRental.description);
    await utils.fillInput(rentalsPO.rentalForm.notes, "Some notes could be put in here");
    await utils.clickElement(rentalsPO.rentalForm.contract);
    await utils.clickElement(rentalsPO.rentalForm.submit);
    await utils.waitForNotVisible(rentalsPO.rentalForm.submit);
    expect((await rentalsPO.getAllRows()).length).to.eql(1);
    await rentalsPO.verifyFieldsByIndex(0, {
      ...newRental,
      expiration: null,
    }, rentalsPO.fieldEvaluator());

    // Renew rental for initial term
    await utils.waitForVisible(rentalsPO.actionButtons.renew);
    await utils.waitForNotVisible(rentalsPO.getLoadingId());
    await rentalsPO.selectRowByIndex(0);
    await utils.clickElement(rentalsPO.actionButtons.renew);
    await utils.waitForVisible(renewPO.renewalForm.submit);
    expect(await utils.getElementText(renewPO.renewalForm.entity)).to.eql(newRental.number);
    await utils.selectDropdownByValue(renewPO.renewalForm.renewalSelect, "1");
    await utils.clickElement(renewPO.renewalForm.submit);
    await utils.waitForNotVisible(renewPO.renewalForm.submit);
    await utils.waitForNotVisible(rentalsPO.getLoadingId());
    expect((await rentalsPO.getAllRows()).length).to.eql(1);
    await rentalsPO.verifyFieldsByIndex(0, {
      ...newRental,
        expiration: moment().add(1, 'M').valueOf()
    }, rentalsPO.fieldEvaluator());

    // Delete the rental
    await utils.waitForVisible(rentalsPO.actionButtons.delete);
    await utils.waitForNotVisible(rentalsPO.getLoadingId());
    await rentalsPO.selectRowByIndex(0);
    await utils.clickElement(rentalsPO.actionButtons.delete);
    await utils.waitForVisible(rentalsPO.deleteRentalModal.submit);
    expect(await utils.getElementText(rentalsPO.deleteRentalModal.member)).to.eql(memberName);
    expect(await utils.getElementText(rentalsPO.deleteRentalModal.number)).to.eql(newRental.number);
    expect(await utils.getElementText(rentalsPO.deleteRentalModal.description)).to.eql(newRental.description);
    await utils.clickElement(rentalsPO.deleteRentalModal.submit);
    await utils.waitForNotVisible(rentalsPO.deleteRentalModal.submit);
    await utils.waitForVisible(rentalsPO.getNoDataRowId());
  });
});