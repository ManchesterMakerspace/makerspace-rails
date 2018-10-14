import { basicUser, adminUser } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";

import { AuthPageObject } from "../pageObjects/auth";
import { PageUtils } from "../pageObjects/common";
import { MemberPageObject } from "../pageObjects/member";
const auth = new AuthPageObject();
const utils = new PageUtils();
const memberPO = new MemberPageObject();

xdescribe("Member Profiles", () => {
  describe("Basic User", () => {
    beforeEach(() => {
      return auth.autoLogin(basicUser);
    });
    describe("Own Profile", () => {
      it("Displays your membership information", () => {

      });
      it("Displays sub-resources pertaining to you", () => {

      });
    });
    describe("Other's Profile", () => {
      it("Displays their membership information", () => {

      });
    });
  });
  describe("Admin User", () => {
    beforeEach(() => {
      return auth.autoLogin(adminUser);
    });
    describe("Own Profile", () => {
      it("Displays your membership information", () => {

      });
      it("Displays sub-resources pertaining to you", () => {

      });
    });
    it("Can edit member's information", () => {

    });
    it("Edit Form Validation", () => {

    })
    it("Can register or replace a keyfob for a member", () => {

    });
    it("Can leave comments about member connected to Slack", () => {

    });
  });
});