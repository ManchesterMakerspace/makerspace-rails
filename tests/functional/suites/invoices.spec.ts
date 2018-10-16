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
      /* 1. Login as basic user
      /* 2. Setup Mocks
          - Load invoices (3 results: 1 upcoming, 1 past due, 1 paid)
          - Pay invoice (for past due result)
          - Load invoices (3 results: 1 upcoming, 2 paid)
        3. Assert table loads correctly
        4. Select past due invoice from table
        5. Click Checkout
        6. Assert directed to checkout form
        7. Select payment method & submit
        8. Assert checkout summary page
        9. Submit
        10. Assert checkout complete confirmation page
        11. Click 'Return to Profile'
        12. Assert invoices displayed in table
      */
    });
    it("Members can review their payment history", () => {
      /* 1. Login as basic user
         2. Setup mocks
          - Load invoices (3 results: 1 upcoming, 1 past due, 1 paid)
         3. Assert invoices listed correctly in user's profile
      */
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
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load invoices (0 results)
          - Create invoice
          - Load invoices (1 result)
         3. Click 'Create Invoice' button
         4. Fill out form & submit
         5. Assert new invoice loaded in profile page
      */
      expect(await browser.getCurrentUrl()).toEqual(utils.buildUrl(targetUrl));
    });
    xit("Can edit invoices for memebrs", () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load invoices (1 result)
          - Edit invoice
          - Load invoices (1 result)
         3. Click 'Edit Invoice' button
         4. Fill out form & submit
         5. Assert updated invoice loaded in profile page
      */
    });
    xit("Can delete invoices for members", () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load invoices (1 result)
          - Delete invoice
          - Load invoices (0 result)
         3. Click 'Delete Invoice' button
         4. Confirm modal
         5. Assert invoice not loaded in profile page
      */
    });
    xit("Can see member's payment history", () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load invoices (3 results: 1 upcoming, 1 past due, 1 paid)
         3. Assert invoices listed correctly in user's profile
      */
    });
  });
});