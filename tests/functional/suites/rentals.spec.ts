import { basicUser, adminUser } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";

import auth from "../pageObjects/auth";
import utils from "../pageObjects/common";
import memberPO from "../pageObjects/member";


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
    const targetUrl = memberPO.getProfilePath(basicUser.id);
    beforeEach(async () => {
      await mock(mockRequests.invoices.get.ok([]));
      await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
      return auth.autoLogin(adminUser, targetUrl);
    });
    it("Can create new rentals for members", () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load rentals (0 results)
          - Create rental
          - Load rentals (1 result)
         3. Click 'Create Rental' button
         4. Fill out form & submit
         5. Assert new rental loaded in profile page
      */
    });
    it("Can edit rentals for memebrs", () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load rentals (1 result)
          - Edit rental
          - Load rentals (1 result)
         3. Click 'Edit Rental' button
         4. Fill out form & submit
         5. Assert updated rental loaded in profile page
      */
    });
    it("Can delete rentals for members", () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load rentals (1 result)
          - Delete rental
          - Load rentals (0 result)
         3. Click 'Delete Rental' button
         4. Confirm modal
         5. Assert rental not loaded in profile page
      */
    });
  });
});