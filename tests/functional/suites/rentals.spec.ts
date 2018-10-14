import { basicUser, adminUser } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";

import { AuthPageObject } from "../pageObjects/auth";
import { PageUtils } from "../pageObjects/common";
import { MemberPageObject } from "../pageObjects/member";
const auth = new AuthPageObject();
const utils = new PageUtils();
const memberPO = new MemberPageObject();

xdescribe("Rentals", () => {
  describe("Basic user", () => {
    beforeEach(() => {
      return auth.autoLogin(basicUser);
    });
    it("Can review and pay for their rentals", () => {

    });
    it("Can request for a new rental", () => {

    });
  });
  describe("Admin user", () => {
    beforeEach(() => {
      return auth.autoLogin(adminUser);
    });
    it("Can create new rentals for members", () => {

    });
    it("Can edit rentals for memebrs", () => {

    });
    it("Can delete rentals for members", () => {

    });
  });
});