describe("Integration tests for new member form", function () {
  var newMemberPage = new NewMemberPage();
  var membersPage = new MembersPage();
  var membershipPage = new MembershipsPage();
  var headerPage = new HeaderPage();
  var currentUser  = protractor.authHelper.adminUsers.user1;
  var newMember = {
    fullname: 'new_member',
    email: 'new_member@test.com',
    password: 'password'
  };
  var groupMember = {
    fullname: 'group_member',
    email: 'group_member@test.com',
    password: 'password',
    group: "Fake Group 1"
  };

  beforeAll(function () {
    return protractor.authHelper.loginUser(currentUser);
  });
  it("Can be navigated to through header", function () {
    return headerPage.goToLink('membership').then(function () {
      expect(membershipPage.onNewMemberTab()).toBeTruthy();
    });
  });
  it("Member contract, name, cardID, membership length, and email are all required", function () {
    newMemberPage.submit().then(function () {
      expect(newMemberPage.inputValid('contractToggle')).toBeFalsy();
      expect(newMemberPage.inputValid('name')).toBeFalsy();
      expect(newMemberPage.inputValid('email')).toBeFalsy();
      expect(newMemberPage.inputValid('renewalMonths')).toBeFalsy();
    });
  });
  it("CardID cannot be manually set", function () {
    expect(newMemberPage.inputEnabled('cardId')).toBeFalsy();
  });
  it("Refresh Card ID button loads the last rejected cardID", function () {
    expect(newMemberPage.getInput('cardId')).toEqual('0002'); //Last created card in seed
    expect(newMemberPage.inputValid('cardId')).toBeTruthy();
    protractor.dbHelper.addRejectionCard().then(function () {
      newMemberPage.refreshCardID().then(function () {
        expect(newMemberPage.getInput('cardId')).toEqual('0003'); //Last created card in seed
        expect(newMemberPage.inputValid('cardId')).toBeTruthy();
      });
    });
  });
  it("If password is entered, so must password confirmation", function () {
    expect(newMemberPage.inputValid('password')).toBeTruthy();
    expect(newMemberPage.inputValid('passwordConfirmation')).toBeTruthy();
    newMemberPage.setInput('password', newMember.password).then(function () {
      expect(newMemberPage.inputValid('password')).toBeFalsy();
      newMemberPage.setInput('passwordConfirmation', newMember.password).then(function () {
        expect(newMemberPage.inputValid('password')).toBeTruthy();
        expect(newMemberPage.inputValid('passwordConfirmation')).toBeTruthy();
      });
    });
  });
  it("Completing fields makes them valid", function () {
    newMemberPage.setInput('name', newMember.fullname).then(function () {
      expect(newMemberPage.getInput('name')).toEqual(newMember.fullname);
      expect(newMemberPage.inputValid('name')).toBeTruthy();
      newMemberPage.toggleContractInput().then(function () {
        browser.sleep(1000).then(function () {
          expect(newMemberPage.inputValid('contractToggle')).toBeTruthy();
          newMemberPage.setInput('email', newMember.email).then(function () {
            expect(newMemberPage.getInput('email')).toEqual(newMember.email);
            expect(newMemberPage.inputValid('email')).toBeTruthy();
            newMemberPage.setRenewal(1).then(function () {
              expect(newMemberPage.inputValid('renewalMonths')).toBeTruthy();
            });
          });
        });
      });
    });
  });
  it("Submitting form adds it to new members list", function () {
    expect(membershipPage.getUpdatedMembers().count()).toEqual(0);
    newMemberPage.submit().then(function () {
      expect(membershipPage.getUpdatedMembers().count()).toEqual(1);
      expect(membershipPage.getMemberName(membershipPage.getUpdatedMembers().first())).toEqual(newMember.fullname)
      membershipPage.getMemberExpiry(membershipPage.getUpdatedMembers().first()).then(function (expiry) {
        expect(new Date(expiry).getTime()).toBeGreaterThan(Date.now());
      });
    });
  });
  it("New member can be found in members page", function () {
    membersPage.get().then(function () {
      membersPage.setSearchInput(newMember.email).then(function () {
        expect(membersPage.getMemberName(membersPage.getMembers().first())).toEqual(newMember.fullname);
      });
    });
  });
  it("New member can log in", function () {
    protractor.pageHelper.clearAlerts().then(function () {
      protractor.authHelper.loginUser(newMember).then(function () {
        expect(protractor.pageHelper.getSuccessAlerts().count()).toEqual(1);
        expect(protractor.pageHelper.getErrorAlerts().count()).toEqual(0);
      });
    });
  });
  describe("Group member register", function () {
    var groupExpiry;
    beforeAll(function () {
      return protractor.authHelper.loginUser(currentUser).then(function () {
        return membersPage.get().then(function () {
          return membersPage.setSearchInput('admin_member_0@test.com').then(function () {
            return membersPage.getMemberExpiration(membersPage.getMembers().first()).then(function (expiry) {
              groupExpiry = expiry;
            });
          });
        });
      });
    });
    it("Next member gets a different card Id", function () {
      headerPage.goToLink('membership').then(function () {
        newMemberPage.refreshCardID().then(function () {
          expect(newMemberPage.getInput('cardId')).toEqual('0001'); //Last created card in seed
          expect(newMemberPage.inputValid('cardId')).toBeTruthy();
        });
      });
    });
    it("Member can be created as part of a group", function () {
      newMemberPage.setInput('name', groupMember.fullname).then(function () {
        newMemberPage.toggleContractInput().then(function () {
          newMemberPage.setInput('email', groupMember.email).then(function () {
            newMemberPage.setRenewal(12).then(function () {
              newMemberPage.setGroup(groupMember.group).then(function () {
                newMemberPage.submit().then(function () {
                  expect(membershipPage.getUpdatedMembers().count()).toEqual(1);
                  expect(membershipPage.getMemberName(membershipPage.getUpdatedMembers().first())).toEqual(groupMember.fullname)
                  membershipPage.getMemberExpiry(membershipPage.getUpdatedMembers().first()).then(function (expiry) {
                    expect(new Date(expiry).getTime()).toBeGreaterThan(Date.now());
                  });
                });
              });
            });
          });
        });
      });
    });
    it("Member's expiration is set to group expiration", function () {
      expect(membershipPage.getMemberExpiry(membershipPage.getUpdatedMembers().first())).toEqual(groupExpiry);
    });
  });
});
