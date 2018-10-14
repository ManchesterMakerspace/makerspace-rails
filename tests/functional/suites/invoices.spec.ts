import { basicUser, adminUser } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";
import { AuthPageObject } from "../pageObjects/auth";
import { PageUtils } from "../pageObjects/common";
import { MemberPageObject } from "../pageObjects/member";
const auth = new AuthPageObject();
const utils = new PageUtils();
const memberPO = new MemberPageObject();

describe("Invoicing and Dues", () => {
  xdescribe("Basic User", () => {
    beforeEach(() => {
      return auth.autoLogin(basicUser);
    });
    it("Members can log in and pay outstanding dues", () => {

    });
    it("Members can review their payment history", () => {

    });
  });
  describe("Admin User", () => {
    const targetUrl = memberPO.getProfileUrl(basicUser.id);
    beforeEach(async () => {
      await mock(mockRequests.invoices.get.ok([]));
      await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
      return auth.autoLogin(adminUser, targetUrl);
    });
    it("Can create new invoices for members", async () => {
      expect(await browser.getCurrentUrl()).toEqual(utils.buildUrl(targetUrl));
    });
    xit("Can edit invoices for memebrs", () => {

    });
    xit("Can delete invoices for members", () => {

    });
    xit("Can see member's payment history", () => {

    });
  });
});