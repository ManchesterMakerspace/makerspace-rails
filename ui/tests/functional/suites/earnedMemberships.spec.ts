import moment from "moment";
import { expect } from "chai";
import { timeToDate } from "ui/utils/timeToDate";
import { EarnedMembership, Report, Requirement, ReportRequirement } from "makerspace-ts-api-client";
import { LoginMember } from "../../pageObjects/auth";
import { adminUser, defaultMembers, basicUser } from "../../constants/member";
import { defaultMemberships, basicEarnedMembership, basicRequirement, defaultReports, basicReport, basicReportRequirement } from "../../constants/earnedMembership";
import membershipPO from "../../pageObjects/earnedMembership";
import reportPO from "../../pageObjects/report";
import utils from "../../pageObjects/common";
import header from "../../pageObjects/header";
import memberPO from "../../pageObjects/member";
import { autoLogin } from "../autoLogin";
import { loadMockserver } from "../mockserver";
const mocker = loadMockserver();

describe("Earned Memberships", () => {
  afterEach(() => mocker.reset());

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
        ...firstMembership,
        requirements: [newRequirement, newRequirement2],
      };

      beforeEach(() => {
        return autoLogin(mocker, adminUser, undefined, { earned_membership: true }).then(async () => {
          mocker.adminListEarnedMemberships_200({}, membershipList);
          await header.navigateTo(header.links.earnedMemberships);
          await utils.waitForPageLoad(membershipPO.listUrl);
          expect(await utils.isElementDisplayed(membershipPO.getErrorRowId())).to.be.false;
          expect(await utils.isElementDisplayed(membershipPO.getNoDataRowId())).to.be.false;
          expect(await utils.isElementDisplayed(membershipPO.getLoadingId())).to.be.false;
          expect(await utils.isElementDisplayed(membershipPO.getTitleId())).to.be.true;
          expect(!!(await membershipPO.getColumnText("expirationTime", membershipList[0].id))).to.be.true;
        });
      });
      it("Loads a list of earned memberships", async () => {
        await membershipPO.verifyListView(membershipList, membershipPO.fieldEvaluator);
      });
      it("Can create new earned memberships for members", async () => {
        await utils.clickElement(membershipPO.actionButtons.create);
        await utils.waitForVisible(membershipPO.membershipForm.submit);

        // TODO: Rows have to be added before filling because row value reset when new row added
        await utils.clickElement(membershipPO.membershipForm.addRequirementButton);

        mocker.listMembers_200({}, defaultMembers, { unlimited: true });
        await utils.fillAsyncSearchInput(
          membershipPO.membershipForm.member, 
          defaultMembers[0].email, 
          `${defaultMembers[0].firstname} ${defaultMembers[0].lastname}`
        );

        await utils.selectDropdownByValue(membershipPO.requirementForm(0).nameSelect, "Other");
        await utils.fillInput(membershipPO.requirementForm(0).nameInput, newRequirement.name);
        await utils.selectDropdownByValue(membershipPO.requirementForm(0).targetCount, String(newRequirement.targetCount));
        await utils.selectDropdownByValue(membershipPO.requirementForm(0).termLengthSelect, String(newRequirement.termLength));
        await utils.selectDropdownByValue(membershipPO.requirementForm(1).nameSelect, "Other");
        await utils.fillInput(membershipPO.requirementForm(1).nameInput, newRequirement2.name);
        await utils.selectDropdownByValue(membershipPO.requirementForm(1).targetCount, String(newRequirement2.targetCount));
        await utils.selectDropdownByValue(membershipPO.requirementForm(1).termLengthSelect, String(newRequirement2.termLength));

        mocker.adminCreateEarnedMembership_200({ body: {
          memberId: initMembership.memberId,
          requirements: [
            ...initMembership.requirements.map(r => {
              const { name, rolloverLimit, termLength, targetCount, strict } = r;
              return { name, rolloverLimit, termLength, targetCount, strict };
            })
          ]
        } }, initMembership);
        mocker.adminListEarnedMemberships_200({}, [initMembership]);
        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.waitForNotVisible(membershipPO.membershipForm.submit);
        expect((await membershipPO.getAllRows()).length).to.eql(1);
        await membershipPO.verifyFields(initMembership, membershipPO.fieldEvaluator);
      });
      it("Can edit earned memberships from list", async () => {
        const origRequirements = firstMembership.requirements;
        const updatedRequirement = {
          ...basicRequirement,
          termLength: 3,
          targetCount: 9
        };
        const updatedMembership = {
          ...firstMembership,
          requirements: [updatedRequirement]
        };

        mocker.listMembers_200({}, defaultMembers);
        await membershipPO.selectRow(firstMembership.id);
        await utils.clickElement(membershipPO.actionButtons.edit);
        await utils.waitForVisible(membershipPO.membershipForm.submit);

        expect(await utils.getElementText(membershipPO.membershipForm.member)).to.eql(firstMembership.memberName)
        expect(await utils.getElementAttribute(
          membershipPO.requirementForm(0).nameSelect.replace("#", `[name="`) + '"]', "value")).to.eql("Other")
        expect(await utils.getElementAttribute(
          membershipPO.requirementForm(0).nameInput.replace("#", `[name="`) + '"]', "value")).to.eql(origRequirements[0].name)
        expect(await utils.getElementAttribute(
          membershipPO.requirementForm(0).targetCount.replace("#", `[name="`) + '"]', "value")).to.eql(String(origRequirements[0].targetCount))
        expect(await utils.getElementAttribute(
          membershipPO.requirementForm(0).termLengthSelect.replace("#", `[name="`) + '"]', "value")).to.eql(String(origRequirements[0].termLength))

        await utils.selectDropdownByValue(membershipPO.requirementForm(0).targetCount, String(updatedRequirement.targetCount));
        await utils.selectDropdownByValue(membershipPO.requirementForm(0).termLengthSelect, String(updatedRequirement.termLength));

        mocker.adminUpdateEarnedMembership_200({ id: updatedMembership.id, body: {
          memberId: initMembership.memberId,
          requirements: updatedMembership.requirements,
        } as any }, updatedMembership);
        mocker.adminListEarnedMemberships_200({}, [updatedMembership]);
        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.waitForNotVisible(membershipPO.membershipForm.submit);
        expect((await membershipPO.getAllRows()).length).to.eql(1);
        await membershipPO.verifyFields(updatedMembership, membershipPO.fieldEvaluator);
      });
      it("Create membership form validation", async () => {
        await utils.clickElement(membershipPO.actionButtons.create);
        await utils.waitForVisible(membershipPO.membershipForm.submit);

        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.assertInputError(membershipPO.membershipForm.member)
        await utils.assertInputError(membershipPO.requirementForm(0).nameSelect)

        mocker.listMembers_200({}, defaultMembers, { unlimited: true });
        await utils.fillAsyncSearchInput(
          membershipPO.membershipForm.member,
          defaultMembers[0].email,
          `${defaultMembers[0].firstname} ${defaultMembers[0].lastname}`
        );

        // TODO: This tests add and remove subform before entering values b/c values reset on adding subform
        expect(await utils.isElementDisplayed(membershipPO.requirementForm(1).nameSelect)).to.be.false;
        await utils.clickElement(membershipPO.membershipForm.addRequirementButton);
        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.assertInputError(membershipPO.requirementForm(1).nameSelect);
        await utils.clickElement(membershipPO.membershipForm.removeRequirementButton);
        expect(await utils.isElementDisplayed(membershipPO.requirementForm(1).nameSelect)).to.be.false;

        await utils.selectDropdownByValue(membershipPO.requirementForm(0).nameSelect, "Other");
        await utils.fillInput(membershipPO.requirementForm(0).nameInput, newRequirement.name);
        await utils.selectDropdownByValue(membershipPO.requirementForm(0).targetCount, String(newRequirement.targetCount));
        await utils.selectDropdownByValue(membershipPO.requirementForm(0).termLengthSelect, String(newRequirement.termLength));

        // No create mock, should display API error
        expect(await utils.isElementDisplayed(membershipPO.membershipForm.error)).to.be.false;
        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.waitForVisible(membershipPO.membershipForm.error);
        mocker.adminCreateEarnedMembership_200({ body: {
          memberId: defaultMembers[0].id,
          requirements: [newRequirement].map(r => {
            const { name, rolloverLimit, termLength, targetCount, strict } = r;
            return { name, rolloverLimit, termLength, targetCount, strict };
          })
        } }, initMembership);
        await utils.clickElement(membershipPO.membershipForm.submit);
        await utils.waitForNotVisible(membershipPO.membershipForm.submit);
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
      beforeEach(async () => {
        mocker.adminListEarnedMembershipReports_200({ id: membership.id }, reports);
        mocker.getMember_200({ id: membershipUser.id }, membershipUser);
        mocker.adminGetEarnedMembership_200({ id: membership.id }, membership);
        await autoLogin(mocker, adminUser, memberPO.getProfilePath(membershipUser.id), { earned_membership: true });
        expect(await utils.isElementDisplayed(reportPO.getErrorRowId())).to.be.false;
        expect(await utils.isElementDisplayed(reportPO.getNoDataRowId())).to.be.false;
        expect(await utils.isElementDisplayed(reportPO.getLoadingId())).to.be.false;
        expect(await utils.isElementDisplayed(reportPO.getTitleId())).to.be.true;
        expect(!!(await reportPO.getColumnText("date", defaultReports[0].id))).to.be.true;
      })
      it("Can view list of reports in profile", async () => {
        await reportPO.verifyListView(reports, reportPO.fieldEvaluator);
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
    beforeEach(async () => {
      mocker.listEarnedMembershipReports_200({ id: membership.id }, defaultReports);
      mocker.getEarnedMembership_200({ id: membership.id }, membership);
      await autoLogin(mocker, membershipUser, undefined, { earned_membership: true });
      expect(await utils.isElementDisplayed(reportPO.getErrorRowId())).to.be.false;
      expect(await utils.isElementDisplayed(reportPO.getNoDataRowId())).to.be.false;
      expect(await utils.isElementDisplayed(reportPO.getLoadingId())).to.be.false;
      expect(await utils.isElementDisplayed(reportPO.getTitleId())).to.be.true;
      expect(!!(await reportPO.getColumnText("date", defaultReports[0].id))).to.be.true;
    })
    it("Can view list of reports in profile", async () => {
      await reportPO.verifyListView(defaultReports, reportPO.fieldEvaluator);
    });
    it("Can submit new reports from profile", async () => {
      await utils.clickElement(reportPO.actionButtons.create);
      await utils.waitForVisible(reportPO.reportForm.submit);

      mocker.listMembers_200({}, defaultMembers);
      await utils.clickElement(reportPO.reportRequirementForm(0).addMemberButton);
      await utils.fillAsyncSearchInput(
        reportPO.reportRequirementForm(0).member(0),
        defaultMembers[0].email,
        `${defaultMembers[0].firstname} ${defaultMembers[0].lastname}`
      );
      await utils.selectDropdownByValue(reportPO.reportRequirementForm(0).reportedCount, String(newReportRequirement.reportedCount));

      const newMemberSearch = defaultMembers.slice(5, 10);
      mocker.listMembers_200({}, newMemberSearch);
      await utils.fillAsyncSearchInput(
        reportPO.reportRequirementForm(0).member(1),
        newMemberSearch[1].email,
        `${newMemberSearch[1].firstname} ${newMemberSearch[1].lastname}`
      );

      const { earnedMembershipId, reportRequirements } = initReport;
      mocker.createEarnedMembershipReport_200({ body: {
        earnedMembershipId,
        reportRequirements: reportRequirements.map(({ requirementId, reportedCount }) => ({
          requirementId, reportedCount, memberIds: [defaultMembers[0].id, newMemberSearch[1].id] 
        }))
      }, id: membership.id }, initReport);
      mocker.listEarnedMembershipReports_200({ id: membership.id }, [initReport]);
      mocker.getEarnedMembership_200({ id: membership.id }, membership, { times: 2 });
      mocker.getMember_200({ id: updatedMember.id }, updatedMember);
      await utils.clickElement(reportPO.reportForm.submit);
      await utils.waitForNotVisible(reportPO.reportForm.submit);
      expect((await reportPO.getAllRows()).length).to.eql(1);
      await reportPO.verifyFields(initReport, reportPO.fieldEvaluator);

      mocker.getMember_200({ id: defaultMembers[0].id }, defaultMembers[0]);
      mocker.getMember_200({ id: defaultMembers[1].id }, defaultMembers[1]);

      await reportPO.viewReport(initReport.id);
      await browser.pause(1000);
      expect(await utils.getElementText(reportPO.reportRequirementForm(0).member(0))).to.eql(`${defaultMembers[0].firstname} ${defaultMembers[0].lastname}`);
      expect(await utils.getElementText(reportPO.reportRequirementForm(0).member(1))).to.eql(`${defaultMembers[1].firstname} ${defaultMembers[1].lastname}`);
      expect(await utils.getElementAttribute(
        reportPO.reportRequirementForm(0).reportedCount.replace("#", `[name="`) + '"]', "value")).to.eql(String(newReportRequirement.reportedCount));
      expect(await utils.getElementText(reportPO.reportForm.reportDate)).to.eql(timeToDate(initReport.date));
    });

    // Creatable doesn't actually work on the select right now
    it.skip("Can create new reports for mentoring non-members", async () => {
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
      await utils.selectDropdownByValue(reportPO.reportRequirementForm(0).reportedCount, String(newReportRequirement.reportedCount));
      
      // Mock no search results found
      mocker.listMembers_200({}, []);
      await utils.selectDropdownByValue(reportPO.reportRequirementForm(0).reportedCount, String(nonMemberRR.reportedCount));
      await utils.fillAsyncSearchInput(reportPO.reportRequirementForm(0).member(0), "foo@foo.com");
      mocker.createEarnedMembershipReport_200({ id: membership.id, body: initReport }, initReport);
      mocker.listEarnedMembershipReports_200({ id: membership.id }, [initReport]);
      mocker.getEarnedMembership_200({ id: membership.id }, membership, { times: 2 });
      mocker.getMember_200({ id: updatedMember.id }, updatedMember);
      await utils.clickElement(reportPO.reportForm.submit);
      await utils.waitForNotVisible(reportPO.reportForm.submit);
      expect((await reportPO.getAllRows()).length).to.eql(1);
      await reportPO.verifyFields(initReport, reportPO.fieldEvaluator);

      await reportPO.viewReport(initReport.id);
      expect(await utils.getElementText(reportPO.reportRequirementForm(0).member(0))).to.eql(nonMemberRR.memberIds[0]);
      expect(await utils.isElementDisplayed(reportPO.reportRequirementForm(0).member(1))).to.be.false;
      expect(await utils.getElementAttribute(reportPO.reportRequirementForm(0).reportedCount, "value")).to.eql(String(nonMemberRR.reportedCount));
      expect(await utils.getElementText(reportPO.reportForm.reportDate)).to.eql(timeToDate(initReport.date));
    });
    it("Create report form validation", async () => {
      await utils.clickElement(reportPO.actionButtons.create);
      await utils.waitForVisible(reportPO.reportForm.submit);


      expect(await utils.isElementDisplayed(reportPO.reportRequirementForm(0).member(1))).to.be.false;
      await utils.clickElement(reportPO.reportRequirementForm(0).addMemberButton);
      expect(await utils.isElementDisplayed(reportPO.reportRequirementForm(0).member(1))).to.be.true;
      await utils.selectDropdownByValue(reportPO.reportRequirementForm(0).reportedCount, String(newReportRequirement.reportedCount));

      // No create mock, should display API error
      expect(await utils.isElementDisplayed(reportPO.reportForm.error)).to.be.false;
      await utils.clickElement(reportPO.reportForm.submit);
      await utils.waitForVisible(reportPO.reportForm.error);

      mocker.createEarnedMembershipReport_200({ 
        id: membership.id, 
        body: {
          earnedMembershipId: initReport.earnedMembershipId,
          reportRequirements:  initReport.reportRequirements.map((rr => {
            const { requirementId, reportedCount } = rr;
            return { requirementId, reportedCount, memberIds: [] };
          }))
        } 
      }, initReport);
      mocker.listEarnedMembershipReports_200({ id: membership.id }, [initReport]);
      mocker.getEarnedMembership_200({ id: membership.id }, membership, { times: 2 });
      mocker.getMember_200({ id: updatedMember.id }, updatedMember);
      await utils.clickElement(reportPO.reportForm.submit);
      await utils.waitForNotVisible(reportPO.reportForm.submit);
      expect(await utils.getElementText(memberPO.memberDetail.expiration)).to.eql(timeToDate(updatedMember.expirationTime));
      // TODO: Should verify strict attr works properly
    });
  });
});