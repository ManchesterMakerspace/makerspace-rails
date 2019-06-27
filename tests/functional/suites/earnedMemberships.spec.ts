import * as moment from "moment";
import { timeToDate } from "ui/utils/timeToDate";
import { EarnedMembership, Report, Requirement, Term, ReportRequirement } from "app/entities/earnedMembership";
import auth, { LoginMember } from "../pageObjects/auth";
import { adminUser, defaultMembers, basicUser } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";
import { defaultMemberships, basicEarnedMembership, basicRequirement, defaultReports, basicReport, basicReportRequirement } from "../constants/earnedMembership";
import membershipPO from "../pageObjects/earnedMembership";
import reportPO from "../pageObjects/report";
import utils from "../pageObjects/common";
import header from "../pageObjects/header";
import memberPO from "../pageObjects/member";

describe("Earned Memberships", () => {
  describe("Admin user", () => {
    describe("From list view", () => {
      const firstMembership: EarnedMembership = {
        ...defaultMemberships[0],
        memberId: defaultMembers[0].id,
        memberName: `${defaultMembers[0].firstname} ${defaultMembers[0].lastname}`
      };
      const membershipList = [...defaultMemberships]
      membershipList.splice(0, 1, firstMembership);
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
            await mock(mockRequests.earnedMemberships.get.ok(membershipList, {}, true));
            await header.navigateTo(header.links.earnedMemberships);
            await utils.waitForPageLoad(membershipPO.listUrl);
            expect(await utils.isElementDisplayed(membershipPO.getErrorRowId())).toBeFalsy();
            expect(await utils.isElementDisplayed(membershipPO.getNoDataRowId())).toBeFalsy();
            expect(await utils.isElementDisplayed(membershipPO.getLoadingId())).toBeFalsy();
            expect(await utils.isElementDisplayed(membershipPO.getTitleId())).toBeTruthy();
            expect(await membershipPO.getColumnText("expirationTime", membershipList[0].id)).toBeTruthy();
        });
      });
      it("Loads a list of earned memberships", async (done) => {
        await membershipPO.verifyListView(membershipList, membershipPO.fieldEvaluator);
        done();
      });
      it("Can create new earned memberships for members", async (done) => {
        await utils.clickElement(membershipPO.actionButtons.create);
        await utils.waitForVisible(membershipPO.membershipForm.submit);

        await mock(mockRequests.members.get.ok(defaultMembers), 0);
        await utils.fillSearchInput(membershipPO.membershipForm.member, defaultMembers[0].email, defaultMembers[0].id);

        await utils.selectDropdownByValue(membershipPO.requirementForm(0).nameSelect, "Other");
        await utils.fillInput(membershipPO.requirementForm(0).nameInput, newRequirement.name);
        await utils.selectDropdownByValue(membershipPO.requirementForm(0).targetCount, String(newRequirement.targetCount));
        await utils.selectDropdownByValue(membershipPO.requirementForm(0).termLengthSelect, String(newRequirement.termLength));

        await utils.clickElement(membershipPO.membershipForm.addRequirementButton);
        await utils.selectDropdownByValue(membershipPO.requirementForm(1).nameSelect, "Other");
        await utils.fillInput(membershipPO.requirementForm(1).nameInput, newRequirement2.name);
        await utils.selectDropdownByValue(membershipPO.requirementForm(1).targetCount, String(newRequirement.targetCount));
        await utils.selectDropdownByValue(membershipPO.requirementForm(1).termLengthSelect, String(newRequirement2.termLength));

        await mock(mockRequests.earnedMemberships.post.ok(initMembership));
        await mock(mockRequests.earnedMemberships.get.ok([initMembership], undefined, true));
        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.waitForNotVisible(membershipPO.membershipForm.submit);
        expect((await membershipPO.getAllRows()).length).toEqual(1);
        await membershipPO.verifyFields(initMembership, membershipPO.fieldEvaluator);
        done();
      });
      it("Can edit earned memberships from list", async () => {
        const origRequirements = firstMembership.requirements;
        const updatedRequirement = {
          ...basicRequirement,
          termLength: 3,
          targetCount: 999
        };
        const updatedMembership = {
          ...firstMembership,
          requirements: [updatedRequirement]
        };

        await mock(mockRequests.members.get.ok(defaultMembers));
        await membershipPO.selectRow(firstMembership.id);
        await utils.clickElement(membershipPO.actionButtons.edit);
        await utils.waitForVisible(membershipPO.membershipForm.submit);

        expect(await utils.getElementText(membershipPO.membershipForm.member)).toEqual(firstMembership.memberName)
        expect(await utils.getElementAttribute(membershipPO.requirementForm(0).nameSelect, "value")).toEqual("Other")
        expect(await utils.getElementAttribute(membershipPO.requirementForm(0).nameInput, "value")).toEqual(origRequirements[0].name)
        expect(await utils.getElementAttribute(membershipPO.requirementForm(0).targetCount, "value")).toEqual(String(origRequirements[0].targetCount))
        expect(await utils.getElementAttribute(membershipPO.requirementForm(0).termLengthSelect, "value")).toEqual(String(origRequirements[0].termLength))

        await utils.selectDropdownByValue(membershipPO.requirementForm(0).targetCount, String(newRequirement.targetCount));
        await utils.selectDropdownByValue(membershipPO.requirementForm(0).termLengthSelect, String(updatedRequirement.termLength));

        await mock(mockRequests.earnedMemberships.put.ok(updatedMembership));
        await mock(mockRequests.earnedMemberships.get.ok([updatedMembership], undefined, true));
        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.waitForNotVisible(membershipPO.membershipForm.submit);
        expect((await membershipPO.getAllRows()).length).toEqual(1);
        await membershipPO.verifyFields(updatedMembership, membershipPO.fieldEvaluator);
      });
      it("Create membership form validation", async (done) => {
        await utils.clickElement(membershipPO.actionButtons.create);
        await utils.waitForVisible(membershipPO.membershipForm.submit);

        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.assertInputError(membershipPO.membershipForm.member)
        await utils.assertInputError(membershipPO.requirementForm(0).nameSelect)

        await mock(mockRequests.members.get.ok(defaultMembers), 0);
        await utils.fillSearchInput(membershipPO.membershipForm.member, defaultMembers[0].email, defaultMembers[0].id);

        await utils.selectDropdownByValue(membershipPO.requirementForm(0).nameSelect, "Other");
        await utils.fillInput(membershipPO.requirementForm(0).nameInput, newRequirement.name);
        await utils.selectDropdownByValue(membershipPO.requirementForm(0).targetCount, String(newRequirement.targetCount));
        await utils.selectDropdownByValue(membershipPO.requirementForm(0).termLengthSelect, String(newRequirement.termLength));

        expect(await utils.isElementDisplayed(membershipPO.requirementForm(1).nameSelect)).toBeFalsy();
        await utils.clickElement(membershipPO.membershipForm.addRequirementButton);
        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.assertInputError(membershipPO.requirementForm(1).nameSelect);
        await utils.clickElement(membershipPO.membershipForm.removeRequirementButton);
        expect(await utils.isElementDisplayed(membershipPO.requirementForm(1).nameSelect)).toBeFalsy();

        // No create mock, should display API error
        expect(await utils.isElementDisplayed(membershipPO.membershipForm.error)).toBeFalsy();
        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.waitForVisible(membershipPO.membershipForm.error);
        await mock(mockRequests.earnedMemberships.post.ok(initMembership));
        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.waitForNotVisible(membershipPO.membershipForm.submit);
        done();
      });
    });
    describe("Viewing earned member's reports", () => {
      const membershipUser: LoginMember = {
        ...basicUser,
        earnedMembershipId: "foo"
      }
      const membership = {
        ...basicEarnedMembership,
        memberId: basicUser.id,
        id: membershipUser.earnedMembershipId,
      }
      const reports: Report[] = defaultReports.map(r => ({ ...r, earnedMembership: membership.id }));
      beforeEach(() => {
        return mock(mockRequests.earnedMembershipReports.get.ok(membership.id, reports, {}, true)).then(async () => {
          await mock(mockRequests.member.get.ok(membershipUser.id, membershipUser));
          await mock(mockRequests.earnedMemberships.show.ok(membership, true));
          await auth.autoLogin(adminUser, memberPO.getProfilePath(membershipUser.id), { earned_membership: true });
          expect(await utils.isElementDisplayed(reportPO.getErrorRowId())).toBeFalsy();
          expect(await utils.isElementDisplayed(reportPO.getNoDataRowId())).toBeFalsy();
          expect(await utils.isElementDisplayed(reportPO.getLoadingId())).toBeFalsy();
          expect(await utils.isElementDisplayed(reportPO.getTitleId())).toBeTruthy();
          expect(await reportPO.getColumnText("date", defaultReports[0].id)).toBeTruthy();
        });
      })
      it("Can view list of reports in profile", async (done) => {
        await reportPO.verifyListView(reports, reportPO.fieldEvaluator);
        done();
      });
    });
  });
  describe("Earned member reporting", () => {
    const membershipUser = {
      ...basicUser,
      earnedMembershipId: "foo"
    }
    const updatedMember: LoginMember = {
      ...membershipUser,
      expirationTime: moment().add(2, "months").valueOf()
    }
    const membership = {
      ...basicEarnedMembership,
      memberId: updatedMember.id,
      id: membershipUser.earnedMembershipId,
    }
    const newReportRequirement: ReportRequirement = {
      ...basicReportRequirement,
      memberIds: [defaultMembers[0].id, defaultMembers[1].id]
    };
    const initReport: Report = {
      ...basicReport,
      earnedMembershipId: membership.id,
      reportRequirements: [newReportRequirement]
    };
    beforeEach(() => {
      return mock(mockRequests.earnedMembershipReports.get.ok(membership.id, defaultReports, {})).then(async () => {
        await mock(mockRequests.earnedMemberships.show.ok(membership));
        await auth.autoLogin(membershipUser, undefined, { earned_membership: true });
        expect(await utils.isElementDisplayed(reportPO.getErrorRowId())).toBeFalsy();
        expect(await utils.isElementDisplayed(reportPO.getNoDataRowId())).toBeFalsy();
        expect(await utils.isElementDisplayed(reportPO.getLoadingId())).toBeFalsy();
        expect(await utils.isElementDisplayed(reportPO.getTitleId())).toBeTruthy();
        expect(await reportPO.getColumnText("date", defaultReports[0].id)).toBeTruthy();
      });
    })
    it("Can view list of reports in profile", async (done) => {
      await reportPO.verifyListView(defaultReports, reportPO.fieldEvaluator);
      done();
    });
    it("Can submit new reports from profile", async (done) => {
      await utils.clickElement(reportPO.actionButtons.create);
      await utils.waitForVisible(reportPO.reportForm.submit);

      await mock(mockRequests.members.get.ok(defaultMembers));
      await utils.clickElement(reportPO.reportRequirementForm(0).addMemberButton);
      await utils.fillSearchInput(reportPO.reportRequirementForm(0).member(0), defaultMembers[0].email, defaultMembers[0].id);
      await utils.selectDropdownByValue(reportPO.reportRequirementForm(0).reportedCount, String(newReportRequirement.reportedCount));

      const newMemberSearch = defaultMembers.slice(5, 10);
      await mock(mockRequests.members.get.ok(newMemberSearch));
      await utils.fillSearchInput(reportPO.reportRequirementForm(0).member(1), newMemberSearch[1].email, newMemberSearch[1].id);

      await mock(mockRequests.earnedMembershipReports.post.ok(membership.id, initReport));
      await mock(mockRequests.earnedMembershipReports.get.ok(membership.id, [initReport]));
      await mock(mockRequests.earnedMemberships.show.ok(membership), 2);
      await mock(mockRequests.member.get.ok(updatedMember.id, updatedMember));
      await utils.clickElement(reportPO.reportForm.submit);
      await utils.waitForNotVisible(reportPO.reportForm.submit);
      expect((await reportPO.getAllRows()).length).toEqual(1);
      await reportPO.verifyFields(initReport, reportPO.fieldEvaluator);


      await mock(mockRequests.member.get.ok(defaultMembers[0].id, defaultMembers[0]));
      await mock(mockRequests.member.get.ok(defaultMembers[1].id, defaultMembers[1]));

      await reportPO.viewReport(initReport.id);
      expect(await utils.getElementText(reportPO.reportRequirementForm(0).member(0))).toEqual(newReportRequirement.memberIds[0]);
      expect(await utils.getElementText(reportPO.reportRequirementForm(0).member(1))).toEqual(newReportRequirement.memberIds[1]);
      expect(await utils.getElementAttribute(reportPO.reportRequirementForm(0).reportedCount, "value")).toEqual(String(newReportRequirement.reportedCount));
      expect(await utils.getElementText(reportPO.reportForm.reportDate)).toEqual(timeToDate(initReport.date));
      done();
    });
    it("Can create new reports for mentoring non-members", async (done) => {
      const nonMemberRR: ReportRequirement = {
        ...basicReportRequirement,
        memberIds: ["foo@foo.com"]
      };
      const initReport: Report = {
        ...basicReport,
        earnedMembershipId: membership.id,
        reportRequirements: [nonMemberRR]
      };


      await utils.clickElement(reportPO.actionButtons.create);
      await utils.waitForVisible(reportPO.reportForm.submit);

      // Mock no search results found
      await mock(mockRequests.members.get.ok([]));
      await utils.selectDropdownByValue(reportPO.reportRequirementForm(0).reportedCount, String(nonMemberRR.reportedCount));
      await utils.fillSearchInput(reportPO.reportRequirementForm(0).member(0), "foo@foo.com");

      await mock(mockRequests.earnedMembershipReports.post.ok(membership.id, initReport));
      await mock(mockRequests.earnedMembershipReports.get.ok(membership.id, [initReport]));
      await mock(mockRequests.earnedMemberships.show.ok(membership), 2);
      await mock(mockRequests.member.get.ok(updatedMember.id, updatedMember));
      await utils.clickElement(reportPO.reportForm.submit);
      await utils.waitForNotVisible(reportPO.reportForm.submit);
      expect((await reportPO.getAllRows()).length).toEqual(1);
      await reportPO.verifyFields(initReport, reportPO.fieldEvaluator);

      await reportPO.viewReport(initReport.id);
      expect(await utils.getElementText(reportPO.reportRequirementForm(0).member(0))).toEqual(nonMemberRR.memberIds[0]);
      expect(await utils.isElementDisplayed(reportPO.reportRequirementForm(0).member(1))).toBeFalsy();
      expect(await utils.getElementAttribute(reportPO.reportRequirementForm(0).reportedCount, "value")).toEqual(String(nonMemberRR.reportedCount));
      expect(await utils.getElementText(reportPO.reportForm.reportDate)).toEqual(timeToDate(initReport.date));
      done();
    });
    it("Create report form validation", async (done) => {
      await utils.clickElement(reportPO.actionButtons.create);
      await utils.waitForVisible(reportPO.reportForm.submit);


      expect(await utils.isElementDisplayed(reportPO.reportRequirementForm(0).member(1))).toBeFalsy();
      await utils.clickElement(reportPO.reportRequirementForm(0).addMemberButton);
      expect(await utils.isElementDisplayed(reportPO.reportRequirementForm(0).member(1))).toBeTruthy();
      await utils.selectDropdownByValue(reportPO.reportRequirementForm(0).reportedCount, String(newReportRequirement.reportedCount));

      // No create mock, should display API error
      expect(await utils.isElementDisplayed(reportPO.reportForm.error)).toBeFalsy();
      await utils.clickElement(reportPO.reportForm.submit);
      await utils.waitForVisible(reportPO.reportForm.error);
      await mock(mockRequests.earnedMembershipReports.post.ok(membership.id, initReport));
      await mock(mockRequests.earnedMembershipReports.get.ok(membership.id, [initReport]));
      await mock(mockRequests.earnedMemberships.show.ok(membership), 2);
      await mock(mockRequests.member.get.ok(updatedMember.id, updatedMember));
      await utils.clickElement(reportPO.reportForm.submit);
      await utils.waitForNotVisible(reportPO.reportForm.submit);
      expect(await utils.getElementText(memberPO.memberDetail.expiration)).toEqual(timeToDate(updatedMember.expirationTime));
      // TODO: Should verify strict attr works properly
      done();
    });
  });
});