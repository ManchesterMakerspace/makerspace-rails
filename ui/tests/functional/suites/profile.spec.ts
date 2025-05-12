import { expect } from "chai";
import moment from "moment";

import { basicUser, adminUser, basicMembers } from "../../constants/member";
import { CardStatus } from "app/entities/card";
import { LoginMember } from "../../pageObjects/auth";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import rentalPO from "../../pageObjects/rentals";
import invoicePo from "../../pageObjects/invoice";
import transactionPO from "../../pageObjects/transactions";
import { defaultRentals } from "../../constants/rental";
import { defaultInvoices } from "../../constants/invoice";
import { defaultTransactions } from "../../constants/transaction";
import { autoLogin } from "../autoLogin";
import { loadMockserver } from "../mockserver";
import { updateMember } from "makerspace-ts-api-client";
const mocker = loadMockserver();

const reviewMemberInfo = async (loggedInUser: LoginMember, viewingMember?: LoginMember, executeLogin: boolean = true) => {
  if (!viewingMember) viewingMember = loggedInUser;

  if (executeLogin) {
    mocker.getMember_200({ id: viewingMember.id }, viewingMember);
    // await mock(mockRequests.member.get.ok(viewingMember.id, viewingMember, true));
    await autoLogin(mocker, loggedInUser, memberPO.getProfilePath(viewingMember.id), { billing: true });
  }
  await memberPO.verifyProfileInfo(viewingMember);
}

const mockSubResources = (member: LoginMember, admin: boolean = false,  ownProfile: boolean = false) => {
  const memberDetails = {
    memberId: member.id,
    memberName: `${member.firstname} ${member.lastname}`,
  };
  const rentals = defaultRentals.map(r => ({...r, ...memberDetails }));
  const invoices = defaultInvoices.map(i => ({...i, ...memberDetails }));
  const transactions = defaultTransactions.map(t => ({...t, ...memberDetails }));
  // Go to rentals
  // Rentals displayed
  if (admin) {
    mocker.adminListRentals_200({ ...!ownProfile && { memberId: member.id }}, rentals);
    mocker.adminListInvoices_200({}, invoices);
    mocker.adminListTransaction_200({}, transactions);
  } else {
    mocker.listRentals_200({}, rentals);
    mocker.listInvoices_200({}, invoices);
    mocker.listTransactions_200({}, transactions);
  }
 
  return { rentals, invoices, transactions };
};

const reviewSubResource = async (member: LoginMember, admin: boolean = false,  ownProfile: boolean = false) => {
  const  {
    rentals,
    invoices,
    transactions
  } = mockSubResources(member,admin, ownProfile);

  await memberPO.goToMemberRentals();
  await utils.waitForVisible(rentalPO.getTitleId());
  await utils.waitForNotVisible(rentalPO.getLoadingId());
  await rentalPO.verifyListView(rentals, rentalPO.fieldEvaluator());

  // Go to invoices
  // Invoices displayed
  await memberPO.goToMemberDues();
  await utils.waitForVisible(invoicePo.getTitleId());
  await utils.waitForNotVisible(invoicePo.getLoadingId());
  await invoicePo.verifyListView(invoices, invoicePo.fieldEvaluator());

  // Go to transactions
  // Transactions displayed
  await memberPO.goToMemberTransactions();
  await utils.waitForVisible(transactionPO.getTitleId());
  await utils.waitForNotVisible(transactionPO.getLoadingId());
  await transactionPO.verifyListView(transactions, transactionPO.fieldEvaluator());
}

describe("Member Profiles", () => {
  afterEach(() => mocker.reset());

  describe("Basic User", () => {
    describe("Own Profile", () => {
      it("Displays your membership information", async () => {
        /* 1. Login as basic user
           2. Assert information block contains logged in member's info
        */
        await reviewMemberInfo(basicUser);
      });
      it("Displays sub-resources pertaining to you", async () => {
        /* 1. Login as basic user
           2. Assert profile shows tables for: Dues, Rentals,
        */
       mockSubResources(basicUser);
        return autoLogin(mocker, basicUser, undefined, { billing: true }).then(async () => {
          await reviewSubResource(basicUser);
        });
      });
    });
    describe("Other's Profile", () => {
      it("Displays their membership information", async () => {
        /* 1. Login as basic user
           2. Navigate to another user's profile
           2. Assert information block contains other member's info
        */
        const loggedInUser = basicMembers[0];
        const viewingMember = basicMembers[1];
        await reviewMemberInfo(loggedInUser, viewingMember);
        expect(await utils.isElementDisplayed(memberPO.memberDetail.duesTab)).to.be.false;
        expect(await utils.isElementDisplayed(memberPO.memberDetail.rentalsTab)).to.be.false;
        expect(await utils.isElementDisplayed(memberPO.memberDetail.transactionsTab)).to.be.false;
      });
    });
  });
  describe("Admin User", () => {
    describe("Own Profile", () => {
      it("Displays your membership information", async () => {
        /* 1. Login as admin
           2. Assert information block contains logged in member's info
        */
        await reviewMemberInfo(adminUser);
      });
      it("Displays sub-resources pertaining to you", async () => {
        /* 1. Login as admin
           2. Assert profile shows tables for: Dues, Rentals,
        */
        return autoLogin(mocker, adminUser, undefined, { billing: true }).then(() => {
          return reviewSubResource(adminUser, true, true);
        })
      });
    });
    describe("Other's Profile", () => {
      const viewingMember = basicMembers[1];
      const updatedMember = {
        ...viewingMember,
        firstname: "Updated",
        lastname: "Member",
        email: "updated_member@test.com",
      }

      it("Displays their membership information and sub-resources", async () => {
        /* 1. Login as admin user
           2. Navigate to another user's profile
           2. Assert information block contains other member's info
        */
        await reviewMemberInfo(adminUser, viewingMember);
        await reviewSubResource(viewingMember, true);
      });
      it("Can edit member's information", async () => {
        /* 1. Login as admin and nav to basic user's profile
           2. Setup mocks
            - Edit member
            - Load updated member's profile
          3. Click 'Edit Member' button
          4. Change something in form & submit
          5. Assert updated information is dislayed
        */
        mocker.getMember_200({ id: viewingMember.id }, viewingMember);
        await autoLogin(mocker, adminUser, memberPO.getProfilePath(viewingMember.id));
        await utils.clickElement(memberPO.memberDetail.openEditButton);
        mocker.adminUpdateMember_200({ id: updatedMember.id, body: {
          email: updatedMember.email,
          firstname: updatedMember.firstname,
          lastname: updatedMember.lastname,
        } }, updatedMember);
        mocker.getMember_200({ id: updatedMember.id }, updatedMember);
        await utils.fillInput(memberPO.memberForm.email, "");
        await utils.fillInput(memberPO.memberForm.email, updatedMember.email);
        await utils.fillInput(memberPO.memberForm.firstname, updatedMember.firstname);
        await utils.fillInput(memberPO.memberForm.lastname, updatedMember.lastname);
        await utils.inputTime(memberPO.memberForm.expiration, updatedMember.expirationTime)
        await utils.clickElement(memberPO.memberForm.submit);
        await utils.waitForNotVisible(memberPO.memberForm.submit);
        await reviewMemberInfo(adminUser, updatedMember, false);
      });
      it("Edit Form Validation", async () => {
        /* 1. Login as admin and nav to basic user's profile
           2. Click 'Edit Member' button
           3. Remove first name, last name, and email and submit
           4. Assert errors
           5. Fill back in values but email w/ invalid email
           6. Submit & assert invalid email error
           7. Enter valid email & submit (no mock so api request fails)
           8. Assert form error is displayed
           9. Setup mock and submit
           10. Assert modal closes
        */
        mocker.getMember_200({ id: viewingMember.id }, viewingMember);
        await autoLogin(mocker, adminUser, memberPO.getProfilePath(viewingMember.id));
        await utils.clickElement(memberPO.memberDetail.openEditButton);
        await utils.fillInput(memberPO.memberForm.email, "");
        await utils.fillInput(memberPO.memberForm.firstname, "");
        await utils.fillInput(memberPO.memberForm.lastname, "");
        await utils.clickElement(memberPO.memberForm.submit);
        await utils.assertInputError(memberPO.memberForm.firstname);
        await utils.assertInputError(memberPO.memberForm.lastname);
        await utils.assertInputError(memberPO.memberForm.email);
        await utils.fillInput(memberPO.memberForm.email, "foo");
        await utils.fillInput(memberPO.memberForm.firstname, updatedMember.firstname);
        await utils.fillInput(memberPO.memberForm.lastname, updatedMember.lastname);
        await utils.inputTime(memberPO.memberForm.expiration, updatedMember.expirationTime)
        await utils.clickElement(memberPO.memberForm.submit);
        await utils.assertInputError(memberPO.memberForm.email)
        await utils.assertNoInputError(memberPO.memberForm.firstname)
        await utils.assertNoInputError(memberPO.memberForm.lastname)
        await utils.fillInput(memberPO.memberForm.email, updatedMember.email);
        await utils.clickElement(memberPO.memberForm.submit);
        await utils.assertNoInputError(memberPO.memberForm.email)
        expect(!!(await utils.getElementText(memberPO.memberForm.error))).to.be.true;
        mocker.adminUpdateMember_200({ id: updatedMember.id, body: {
          email: updatedMember.email,
          firstname: updatedMember.firstname,
          lastname: updatedMember.lastname,
        } }, updatedMember);
        mocker.getMember_200({ id: updatedMember.id }, updatedMember);
        await utils.clickElement(memberPO.memberForm.submit);
        await utils.waitForNotVisible(memberPO.memberForm.submit);
      });
      it("Can register a keyfob for a member", async () => {
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
       const cardId = "12345-card";
       const foblessMember: LoginMember = {
         ...viewingMember,
         cardId: null
       };
       const updatedMember: LoginMember = {
         ...foblessMember,
         cardId: cardId
       }
        const newCard = {
          id: "345",
          memberId: foblessMember.id,
          uid: cardId,
        }
        const rejectionCard = {
          uid: cardId,
          timeOf: moment().subtract(1, "minute").calendar()
        };

        const openingCard = {
          ...rejectionCard,
          uid: "90210"
        };
        mocker.adminGetNewCard_200(openingCard);
        mocker.getMember_200({ id: foblessMember.id }, foblessMember);
        await autoLogin(mocker, adminUser, memberPO.getProfilePath(foblessMember.id));

        expect(await utils.getElementText(memberPO.memberDetail.openCardButton)).to.match(/Register Fob/i);
        await utils.clickElement(memberPO.memberDetail.openCardButton);
        await utils.waitForVisible(memberPO.accessCardForm.submit);
        await browser.waitUntil(async () => {
          const uid = await utils.getElementText(memberPO.accessCardForm.importConfirmation);
          return uid === openingCard.uid; // Verify auto request works
        }, undefined, `Access card ${openingCard.uid} failed to load`);

        mocker.adminGetNewCard_200(rejectionCard);
        await utils.clickElement(memberPO.accessCardForm.idVerification);
        await utils.clickElement(memberPO.accessCardForm.importButton);
        await browser.waitUntil(async () => {
          const uid = await utils.getElementText(memberPO.accessCardForm.importConfirmation);
          return uid === cardId;
        }, undefined, `Manual import rejection card ${cardId} failed to load`);
        mocker.adminCreateCard_200({ body: { uid: newCard.uid, memberId: foblessMember.id} }, newCard as any);
        mocker.getMember_200({ id: updatedMember.id }, updatedMember);
        await utils.clickElement(memberPO.accessCardForm.submit);
        await utils.waitForNotVisible(memberPO.accessCardForm.submit);
      });
      it("Can replace a keyfob for a member", async () => {
        /* 1. Login as admin and nav to basic user's profile that has a fob
           2. Setup mocks
            - mark card as lost
            - GET rejection card
            - Update Member (changed cardID)
            - Load updated member's profile
           3. Click 'Replace Fob' button
           4. Assert modal opens
           5. Click 'Impoort new Key' button
           6. Assert rejection card ID displayed
           7. Submit
           8. Assert updated member's info
        */
        const cardId = "12345-card";
        const currentCard = {
          id: "abc",
          uid: "1234",
          validity: CardStatus.Inactive
        }
        const fobbedMember: LoginMember = {
          ...viewingMember,
          cardId: currentCard.id
        };
        const updatedMember: LoginMember = {
          ...fobbedMember,
          cardId: cardId
        };
        const newCard = {
          id: "345",
          uid: cardId,
          memberId: fobbedMember.id
        }
        const rejectionCard = {
          uid: cardId,
          timeOf: moment().subtract(1, "minute").calendar()
        };
        const openingCard = {
            ...rejectionCard,
            uid: "90210"
        };
        mocker.adminGetNewCard_200(openingCard);
        mocker.getMember_200({ id: fobbedMember.id }, fobbedMember);
        await autoLogin(mocker, adminUser, memberPO.getProfilePath(fobbedMember.id));

        expect(await utils.getElementText(memberPO.memberDetail.openCardButton)).to.match(/Replace Fob/i);
        await utils.clickElement(memberPO.memberDetail.openCardButton);
        await utils.waitForVisible(memberPO.accessCardForm.submit);
        await browser.waitUntil(async () => {
          const uid = await utils.getElementText(memberPO.accessCardForm.importConfirmation);
          return uid === openingCard.uid; // Verify auto request works
        }, undefined, `Access card ${openingCard.uid} failed to load`);

        mocker.adminGetNewCard_200(rejectionCard);
        await utils.clickElement(memberPO.accessCardForm.idVerification);
        await utils.clickElement(memberPO.accessCardForm.importButton);
        await browser.waitUntil(async () => {
          const uid = await utils.getElementText(memberPO.accessCardForm.importConfirmation);
          return uid === cardId;
        }, undefined, `Manual import rejection card ${cardId} failed to load`);
        mocker.adminCreateCard_200({ body: { uid: newCard.uid, memberId: fobbedMember.id} }, newCard as any);
        mocker.getMember_200({ id: updatedMember.id }, updatedMember);
        await utils.clickElement(memberPO.accessCardForm.submit);
        await utils.waitForNotVisible(memberPO.accessCardForm.submit);
      });
    });
  });
});