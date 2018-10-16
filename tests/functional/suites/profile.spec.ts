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
        /* 1. Login as basic user
           2. Assert information block contains logged in member's info
        */
      });
      it("Displays sub-resources pertaining to you", () => {
        /* 1. Login as basic user
           2. Assert profile shows tables for: Dues, Rentals,
        */
      });
    });
    describe("Other's Profile", () => {
      it("Displays their membership information", () => {
        /* 1. Login as basic user
           2. Navigate to another user's profile
           2. Assert information block contains other member's info
        */
      });
    });
  });
  describe("Admin User", () => {
    describe("Own Profile", () => {
      beforeEach(() => {
        return auth.autoLogin(adminUser);
      });
      it("Displays your membership information", () => {
        /* 1. Login as admin
           2. Assert information block contains logged in member's info
        */
      });
      it("Displays sub-resources pertaining to you", () => {
        /* 1. Login as admin and nav to basic user's profile
           2. Assert profile shows tables for: Dues, Rentals,
        */
      });
    });
    describe("Other's Profile", () => {
      const targetUrl = memberPO.getProfileUrl(basicUser.id);
      beforeEach(async () => {
        await mock(mockRequests.invoices.get.ok([]));
        await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
        return auth.autoLogin(adminUser, targetUrl);
      });

      it("Can edit member's information", () => {
        /* 1. Login as admin and nav to basic user's profile
           2. Setup mocks
            - Edit member
            - Load updated member's profile
          3. Click 'Edit Member' button
          4. Change something in form & submit
          5. Assert updated information is dislayed
        */
      });
      it("Edit Form Validation", () => {
        /* 1. Login as admin and nav to basic user's profile
           2. Click 'Edit Member' button
           3. Remove first name, last name, and email and submit
           4. Assert errors
           5. Fill back in values but email w/ invalid email
           6. Submit & assert invalid email error
           7. Enter valid email & submit (no mock so api request fails)
           8. Assert form error is displayed
        */
      })
      it("Can register a keyfob for a member", () => {
        /* 1. Login as admin and nav to basic user's profile that doesnt have a fob
           2. Setup mocks
            - GET rejection card
            - Update Member (created cardID)
            - Load updated member's profile
           3. Click 'Register Fob' button
           4. Assert modal opens
           5. Click 'Import New Key' button
           6. Assert rejection card ID displayed
           7. Submit
           8. Assert updated member's info
        */
      });
      it("Can replace a keyfob for a member", () => {
        /* 1. Login as admin and nav to basic user's profile that has a fob
           2. Setup mocks
            - GET rejection card
            - Update Member (changed cardID)
            - Load updated member's profile
           3. Click 'Replace Fob' button
           4. Assert modal opens
           5. Click 'Import New Key' button
           6. Assert rejection card ID displayed
           7. Submit
           8. Assert updated member's info
        */
      });
      it("Can leave comments about member connected to Slack", () => {
        /* 1. Login as admin and nav to basic user's profile
           2. Click 'Notes' tab
           3. Assert slack comments displayed
        */
      });
    });
  });
});