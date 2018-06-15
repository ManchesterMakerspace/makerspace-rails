describe("Integration tests for users registering from paypal payment trigger", function () {
  var registerPage = new RegisterPage();
  var invitePage = new InvitePage();
  var membersPage = new MembersPage();
  var newMember = {
    email: "new_self_register@test.com",
    firstname: "Self",
    firstname: "Register",
    password: "password"
  };
  var newGroupMember = {
    email: 'group_self_register@test.com',
    firstname: "Self Register",
    lastname: "Group Member",
    password: "password",
    group: "Fake Group 1"
  };
  var firstRegisterLink, newRegisterLink;
  var memberRow = membersPage.getMembers().first();

  describe("Sending the register invite", function () {
    it("Invite page not available to non admins", function () {
      protractor.authHelper.loginUser(protractor.authHelper.basicUsers.user1).then(function () {
        invitePage.get(newMember.email).then(function () {
          expect(browser.getCurrentUrl()).not.toEqual(invitePage.getUrl(newMember.email));
        });
      });
    });
    it("Admins can view page to Invite a new member by email", function () {
      protractor.authHelper.loginUser(protractor.authHelper.adminUsers.user1).then(function () {
        invitePage.get(newMember.email).then(function () {
          expect(browser.getCurrentUrl()).toEqual(invitePage.getUrl(newMember.email));
        });
      });
    });
    it("Cancelling invite will nav away from page", function () {
      expect(browser.getCurrentUrl()).toEqual(invitePage.getUrl(newMember.email));
      invitePage.cancelInvite().then(function () {
        expect(browser.getCurrentUrl()).not.toEqual(invitePage.getUrl(newMember.email));
      });
    });
    it("Accepting invite sends new member an invite to register", function () {
      invitePage.get(newMember.email).then(function () {
        expect(browser.getCurrentUrl()).toEqual(invitePage.getUrl(newMember.email));
        invitePage.confirmInvite().then(function () {
          browser.sleep(1000).then(function () {
            expect(protractor.mailHelper.emailPresent(newMember.email)).toBeTruthy();
            expect(browser.getCurrentUrl()).not.toEqual(invitePage.getUrl(newMember.email));
            protractor.mailHelper.extractRegisterLink(newMember.email).then(function (e) {
              firstRegisterLink = e;
            });
          });
        });
      });
    });
    it("Register email can be sent again", function () {
      protractor.mailHelper.emptyMail().then(function () {
        invitePage.get(newMember.email).then(function () {
          expect(browser.getCurrentUrl()).toEqual(invitePage.getUrl(newMember.email));
          invitePage.confirmInvite().then(function () {
            browser.sleep(1000).then(function () {
              expect(protractor.mailHelper.emailPresent(newMember.email)).toBeTruthy();
              expect(browser.getCurrentUrl()).not.toEqual(invitePage.getUrl(newMember.email));
              protractor.mailHelper.extractRegisterLink(newMember.email).then(function (e) {
                newRegisterLink = e;
              });
            });
          });
        });
      });
    });
  });
  describe("Self Register", function () {
    beforeAll(function () {
      return protractor.authHelper.logout();
    });
    describe("individual", function () {
      it("Can navigate to register using correct link", function () {
        browser.get(firstRegisterLink).then(function () {
          expect(browser.getCurrentUrl()).not.toMatch(/register\/[0-9]+/);
          browser.get(newRegisterLink).then(function () {
            expect(browser.getCurrentUrl()).toMatch(/register\/[0-9]+/);
          });
        });
      });
      it("Displays welcome message first", function () {
        expect(registerPage.welcomeNoticePresent()).toBeTruthy();
      });
      it("Proceeds to register form", function () {
        registerPage.proceed().then(function () {
          expect(registerPage.welcomeNoticePresent()).toBeFalsy();
          expect(registerPage.registerFormDisplayed()).toBeTruthy();
        });
      });
      describe("Register Form", function () {
        it("Email is prefilled from invite", function () {
          expect(registerPage.inputValid('email')).toBeTruthy();
          expect(registerPage.getInput('email')).toEqual(newMember.email);
          registerPage.setInput('email', '').then(function () {
            expect(registerPage.getInput('email')).toEqual('');
          });
        });
        it("Name, email, and password are required", function () {
          registerPage.proceed().then(function () {
            expect(registerPage.registerFormDisplayed()).toBeTruthy();
            expect(registerPage.inputValid('name')).toBeFalsy();
            expect(registerPage.inputValid('email')).toBeFalsy();
            expect(registerPage.inputValid('password')).toBeFalsy();
            expect(registerPage.inputValid('passwordConfirmation')).toBeFalsy();
            registerPage.setInput('firstname', newMember.firstname).then(function () {
              registerPage.setInput('lastname', newMember.lastname).then(function () {
                expect(registerPage.inputValid('firstname')).toBeTruthy();
                expect(registerPage.inputValid('lastname')).toBeTruthy();
                expect(registerPage.getInput('firstname')).toEqual(newMember.firstname);
                expect(registerPage.getInput('lastname')).toEqual(newMember.lastname);
                registerPage.setInput('email', newMember.email).then(function () {
                  expect(registerPage.inputValid('email')).toBeTruthy();
                  expect(registerPage.getInput('email')).toEqual(newMember.email);
                  registerPage.setInput('password', newMember.password).then(function () {
                    expect(registerPage.getInput('password')).toEqual(newMember.password);
                    registerPage.setInput('passwordConfirmation', 'notPassowrd').then(function () {
                      expect(registerPage.inputValid('password')).toBeFalsy();
                      expect(registerPage.inputValid('passwordConfirmation')).toBeFalsy();
                      registerPage.setInput('passwordConfirmation', newMember.password).then(function () {
                        browser.sleep(1000).then(function () {
                          expect(registerPage.inputValid('password')).toBeTruthy();
                          expect(registerPage.inputValid('passwordConfirmation')).toBeTruthy();
                          expect(registerPage.getInput('passwordConfirmation')).toEqual(newMember.password);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
        it("Valid form proceeds to eSign pages", function () {
          registerPage.proceed().then(function () {
            expect(registerPage.registerFormDisplayed()).toBeFalsy();
          });
        });
      });
      describe("Esign", function () {
        it("Starts with displaying a copy of the Code of Conduct", function () {
          expect(registerPage.codeOfConductDisplayed()).toBeTruthy();
          expect(registerPage.memberContractDisplayed()).toBeFalsy();
        });
        it("Proceeds to Member Contract", function () {
          registerPage.proceed().then(function () {
            expect(registerPage.codeOfConductDisplayed()).toBeFalsy();
            expect(registerPage.memberContractDisplayed()).toBeTruthy();
          });
        });
        it("Signature is needed to continue", function () {
          registerPage.proceed().then(function () {
            expect(registerPage.codeOfConductDisplayed()).toBeFalsy();
            expect(registerPage.memberContractDisplayed()).toBeTruthy();
            registerPage.signContract();
          });
        });
        it("Logs in and redirects to home page when complete", function () {
          registerPage.proceed().then(function () {
            expect(registerPage.memberContractDisplayed()).toBeFalsy();
            expect(registerPage.codeOfConductDisplayed()).toBeFalsy();
            expect(browser.getCurrentUrl()).toEqual(membersPage.getUrl());
            expect(protractor.authHelper.userLoggedIn()).toBeTruthy();
          });
        });
      });
      describe("Created Member", function () {
        it("Member is not an admin", function () {
          membersPage.toggleViewAll().then(function () {
            membersPage.expandMember(memberRow).then(function () {
              //Check that expanding doesn't do anything
              expect(browser.getCurrentUrl()).toEqual(membersPage.getUrl());
            });
          });
        });
        it("New Member can be found on members page", function () { //have to be admin b/c new member is expired
          protractor.authHelper.loginUser(protractor.authHelper.adminUsers.user1).then(function () {
            membersPage.get().then(function () {
              membersPage.setSearchInput(newMember.email).then(function () {
                expect(membersPage.getMemberName(memberRow)).toEqual(newMember.firstname + " " + newMember.lastname);
                membersPage.getMemberExpiration(memberRow).then(function (expiry) {
                  expect(new Date(expiry).getTime()).toBeLessThan(Date.now());
                });
              });
            });
          });
        });
      });
    });
    describe("Group Register", function () {
      var groupExpiry, groupName = 'Fake Group 1';
      beforeAll(function () {
        return protractor.authHelper.loginUser(protractor.authHelper.adminUsers.user1).then(function () {
          return membersPage.get().then(function () {
            return membersPage.setSearchInput('admin_member_0@test.com').then(function () {
              return membersPage.getMemberExpiration(membersPage.getMembers().first()).then(function (expiry) {
                groupExpiry = expiry;
                return invitePage.get(newGroupMember.email).then(function () {
                  return invitePage.confirmInvite().then(function () {
                    return browser.sleep(1000).then(function () {
                      return protractor.mailHelper.extractRegisterLink(newGroupMember.email).then(function (link) {
                        return protractor.authHelper.logout().then(function () {
                          return browser.get(link);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
      it("Checking part of group checkbox displays group dropdown", function () {
        registerPage.proceed().then(function () {
          expect(registerPage.groupInputPresent()).toBeFalsy();
          registerPage.showGroupInput().then(function () {
            expect(registerPage.groupInputPresent()).toBeTruthy();
          });
        });
      });
      it("Group can be selected from dropdown", function () {
        registerPage.setGroup(groupName).then(function () {
          expect(registerPage.getGroup()).toEqual(groupName);
        });
      });
      it("User can register as part of a group", function () {
        registerPage.setInput('firstname', newGroupMember.firstname).then(function () {
          registerPage.setInput('lastname', newGroupMember.lastname).then(function () {
            registerPage.setInput('email', newGroupMember.email).then(function () {
              registerPage.setInput('password', newGroupMember.password).then(function () {
                registerPage.setInput('passwordConfirmation', newGroupMember.password).then(function () {
                  registerPage.proceed().then(function () {
                    registerPage.proceed().then(function () {
                      registerPage.signContract().then(function () {
                        registerPage.proceed().then(function () {
                          expect(browser.getCurrentUrl()).toEqual(membersPage.getUrl());
                          expect(protractor.authHelper.userLoggedIn()).toBeTruthy();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
      it("Member is not an admin", function () {
        membersPage.toggleViewAll().then(function () {
          membersPage.expandMember(memberRow).then(function () {
            //Check that expanding doesn't do anything
            expect(browser.getCurrentUrl()).toEqual(membersPage.getUrl());
          });
        });
      });
      it("User has group's expiration", function () {
        protractor.authHelper.loginUser(protractor.authHelper.adminUsers.user1).then(function () {
          membersPage.get().then(function () {
            membersPage.setSearchInput(newGroupMember.email).then(function () {
              expect(membersPage.getMemberName(memberRow)).toEqual(newGroupMember.firstname + " " + newGroupMember.lastname);
              membersPage.getMemberExpiration(memberRow).then(function (expiry) {
                expect(new Date(expiry).getTime()).toEqual(new Date(groupExpiry).getTime());
              });
            });
          });
        });
      });
    });
  });
});
