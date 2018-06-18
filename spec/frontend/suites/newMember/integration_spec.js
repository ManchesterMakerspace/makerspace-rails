describe("Integration tests for new member form", function () {
  var newMemberPage = new NewMemberPage();
  var membersPage = new MembersPage();
  var membershipPage = new MembershipsPage();
  var headerPage = new HeaderPage();
  var currentUser  = protractor.authHelper.adminUsers.user1;
  var newMember = {
    firstname: 'new',
    lastname: 'member',
    email: 'new_member@test.com',
    password: 'password'
  };
  var groupMember = {
    firstname: 'group',
    lastname: 'member',
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
      expect(newMemberPage.inputValid('firstname')).toBeFalsy();
      expect(newMemberPage.inputValid('lastname')).toBeFalsy();
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
    newMemberPage.setInput('firstname', newMember.firstname).then(function () {
      newMemberPage.setInput('lastname', newMember.lastname).then(function () {
        expect(newMemberPage.getInput('firstname')).toEqual(newMember.firstname);
        expect(newMemberPage.getInput('lastname')).toEqual(newMember.lastname);
        expect(newMemberPage.inputValid('firstname')).toBeTruthy();
        expect(newMemberPage.inputValid('lastname')).toBeTruthy();
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
  });
  it("Submitting form adds it to new members list", function () {
    expect(membershipPage.getUpdatedMembers().count()).toEqual(0);
    newMemberPage.submit().then(function () {
      expect(membershipPage.getUpdatedMembers().count()).toEqual(1);
      expect(membershipPage.getMemberName(membershipPage.getUpdatedMembers().first())).toEqual(newMember.firstname + " " + newMember.lastname);
      membershipPage.getMemberExpiry(membershipPage.getUpdatedMembers().first()).then(function (expiry) {
        expect(new Date(expiry).getTime()).toBeGreaterThan(Date.now());
      });
    });
  });
  it("New member can be found in members page", function () {
    membersPage.get().then(function () {
      membersPage.setSearchInput(newMember.email).then(function () {
        expect(membersPage.getMemberName(membersPage.getMembers().first())).toEqual(newMember.firstname + " " + newMember.lastname);
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
          expect(newMemberPage.getInput('cardId')).toEqual('0002'); //Last created card in seed
          expect(newMemberPage.inputValid('cardId')).toBeTruthy();
        });
      });
    });
    it("Member can be created as part of a group", function () {
      newMemberPage.setInput('firstname', groupMember.firstname).then(function () {
        newMemberPage.setInput('lastname', groupMember.lastname).then(function () {
          newMemberPage.toggleContractInput().then(function () {
            newMemberPage.setInput('email', groupMember.email).then(function () {
              newMemberPage.setRenewal(12).then(function () {
                newMemberPage.setGroup(groupMember.group).then(function () {
                  newMemberPage.submit().then(function () {
                    expect(membershipPage.getUpdatedMembers().count()).toEqual(1);
                    expect(membershipPage.getMemberName(membershipPage.getUpdatedMembers().first())).toEqual(groupMember.firstname + " " + groupMember.lastname)
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
    });
    it("Member's expiration is set to group expiration", function () {
      expect(membershipPage.getMemberExpiry(membershipPage.getUpdatedMembers().first())).toEqual(groupExpiry);
    });
  });
});
