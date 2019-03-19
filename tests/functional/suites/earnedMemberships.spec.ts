import { EarnedMembership, Report, Requirement, Term, ReportRequirement } from "app/entities/earnedMembership";
import auth from "../pageObjects/auth";
import { adminUser, defaultMembers } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";
import { defaultMemberships, basicEarnedMembership, basicRequirement } from "../constants/earnedMembership";
import membershipPO from "../pageObjects/earnedMembership";
import utils from "../pageObjects/common";
import header from "../pageObjects/header";

describe("Earned Memberships", () => {
  describe("Admin user", () => {
    fdescribe("From list view", () => {
      const newRequirement: Requirement = {
          ...basicRequirement,
          name: "Foo",
          termLength: 1,
          targetCount: 2,
      };
      const newRequirement2: Requirement = {
        ...basicRequirement,
        name: "Bar",
        termLength: 3,
        targetCount: 5,
      };
      const initMembership: EarnedMembership = {
        ...basicEarnedMembership,
        requirements: [newRequirement, newRequirement2],
      };

      beforeEach(() => {
        return auth.autoLogin(adminUser, undefined, { earned_membership: true }).then(async () => {
            await mock(mockRequests.earnedMemberships.get.ok(defaultMemberships, {}, true));
            await header.navigateTo(header.links.earnedMemberships);
            await utils.waitForPageLoad(membershipPO.listUrl);
            expect(await utils.isElementDisplayed(membershipPO.getErrorRowId())).toBeFalsy();
            expect(await utils.isElementDisplayed(membershipPO.getNoDataRowId())).toBeFalsy();
            expect(await utils.isElementDisplayed(membershipPO.getLoadingId())).toBeFalsy();
            expect(await utils.isElementDisplayed(membershipPO.getTitleId())).toBeTruthy();
            expect(await membershipPO.getColumnText("expirationTime", defaultMemberships[0].id)).toBeTruthy();
        });
      });
      it("Loads a list of earned memberships", async (done) => {
        await membershipPO.verifyListView(defaultMemberships, membershipPO.fieldEvaluator);
        done();
      });
      fit("Can create new earned memberships for members", async (done) => {
        await utils.clickElement(membershipPO.actionButtons.create);
        await utils.waitForVisible(membershipPO.membershipForm.submit);

        await mock(mockRequests.members.get.ok(defaultMembers), 0);
        await utils.fillSearchInput(membershipPO.membershipForm.member, defaultMembers[0].email, defaultMembers[0].id);

        await utils.fillInput(membershipPO.requirementForm(0).name, newRequirement.name);
        await utils.fillInput(membershipPO.requirementForm(0).targetCount, String(newRequirement.targetCount));
        await utils.selectDropdownByValue(membershipPO.requirementForm(0).termLengthSelect, String(newRequirement.termLength));

        await utils.clickElement(membershipPO.membershipForm.addRequirementButton);
        await utils.fillInput(membershipPO.requirementForm(1).name, newRequirement2.name);
        await utils.fillInput(membershipPO.requirementForm(1).targetCount, String(newRequirement2.targetCount));
        await utils.selectDropdownByValue(membershipPO.requirementForm(1).termLengthSelect, String(newRequirement2.termLength));

        await mock(mockRequests.earnedMemberships.post.ok(initMembership));
        await mock(mockRequests.earnedMemberships.get.ok([initMembership], undefined, true));
        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.waitForNotVisible(membershipPO.membershipForm.submit);
        expect((await membershipPO.getAllRows()).length).toEqual(1);
        await membershipPO.verifyFields(initMembership, membershipPO.fieldEvaluator);
        done();
      });
      xit("Can edit earned memberships from list", async () => {
        const updatedMembership = {
          ...defaultMemberships[0],
          name: "Foobar",
          requirements: [{
            ...basicRequirement,
            termLength: 3
          }]
        };

        await membershipPO.selectRow(defaultMemberships[0].id);



      });
      xit("Create membership form validation", async () => {

      });
    });
  });
  describe("Earned member", () => {
    const membershipUser = {
      ...adminUser,
      earnedMembershipId: "foo"
    }
    beforeEach(() => {
        return auth.autoLogin(adminUser);
    })
    it("Can view list of reports in profile", async () => {

    });
    it("Can submit new reports from profile", async () => {

    });
    it("Create report form validation", async () => {

    });
  });
});