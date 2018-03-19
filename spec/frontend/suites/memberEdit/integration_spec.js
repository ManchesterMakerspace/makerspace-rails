describe("Integration spec for edit member", function  () {
  var editMemberPage = new EditMemberPage();
  var membersPage = new MembersPage();
  var headerPage = new HeaderPage();
  var currentMember = protractor.authHelper.adminUsers.user1;
  var targetUser = protractor.authHelper.basicUsers.user2;

  beforeAll(function () {
    return protractor.authHelper.loginUser(currentMember);
  });

  describe("Basic use", function () {
    it("Can be naved to through members table", function () {
      return membersPage.setSearchInput(targetUser.email).then(function () {
        return membersPage.expandMember(membersPage.getMembers().first()).then(function () {
          expect(browser.getCurrentUrl()).toMatch(editMemberPage.getUrl());
        });
      });
    });
    it("Member name and email can be changed", function () {
      targetUser.fullname = 'New Name';
      targetUser.email = 'new_email@test.com';
      editMemberPage.setInput('name', targetUser.fullname).then(function () {
        editMemberPage.setInput('email', targetUser.email).then(function () {
          editMemberPage.submit().then(function () {
            browser.refresh().then(function () {
              expect(editMemberPage.getInput('name')).toEqual(targetUser.fullname);
              expect(editMemberPage.getInput('email')).toEqual(targetUser.email);
            });
          });
        });
      });
    });
    it("Member expiration can be changed", function () {
      editMemberPage.getExpiry().then(function (initExp) {
        var initDate = new Date(initExp)
        var newDate = new Date(initDate.getTime() + (24 * 60 * 60 * 1000));
        var dateString = newDate.getDate() + " " + newDate.getFullYear();
        var  el = protractor.pageObjectHelper.filterOneByDisplayed(element.all(by.css('td[aria-label$="' + dateString + '"]')));
        editMemberPage.openCalendar().then(function () {
          browser.sleep(1000).then(function () {
            el.click().then(function () {
              editMemberPage.submit().then(function () {
                expect(editMemberPage.getExpiry()).not.toEqual(initExp);
              });
            });
          });
        });
      });
    });
  })
  describe("Adding a card", function () {
    beforeAll(function  () {
      return membersPage.get().then(function () {
        return membersPage.setSearchInput(targetUser.email).then(function () {
          return membersPage.expandMember(membersPage.getMembers().first()).then(function () {
            return editMemberPage.showDetails().then(function () {
              return editMemberPage.getCards().each(function (card) {
                return editMemberPage.reportLost(card);
              });
            });
          });
        });
      });
    });
    it("New Card button only appears when user has no active card", function () {
      expect(editMemberPage.getCards().count()).toEqual(0);
      expect(editMemberPage.newCardButtonPresent()).toBeTruthy();
    });
    it("Clicking new card button opens new card form", function () {
      expect(editMemberPage.refreshCardButtonPresent()).toBeFalsy();
      editMemberPage.startCreateCard().then(function () {
        expect(editMemberPage.refreshCardButtonPresent()).toBeTruthy();
      });
    });
    it("Refresh card button loads latest rejection card", function () {
      protractor.dbHelper.addRejectionCard('0100').then(function () {
        editMemberPage.refreshCardID().then(function () {
          expect(editMemberPage.getInput('cardId')).toEqual('0100');
        });
      });
    });
    it("Creating new card adds card to list and hides new card button", function () {
      editMemberPage.submitNewCard().then(function () {
        expect(editMemberPage.getCards().count()).toEqual(1);
        expect(editMemberPage.newCardButtonPresent()).toBeFalsy();
      });
    });
    it("Reporting  card as lost or stolen addes new card button", function () {
      editMemberPage.reportLost(editMemberPage.getCards().first()).then(function () {
        expect(editMemberPage.newCardButtonPresent()).toBeTruthy();
        editMemberPage.startCreateCard().then(function () {
          protractor.dbHelper.addRejectionCard('0101').then(function () {
            editMemberPage.refreshCardID().then(function () {
              editMemberPage.submitNewCard().then(function () {
                expect(editMemberPage.getCards().count()).toEqual(2);
                expect(editMemberPage.newCardButtonPresent()).toBeFalsy();
                editMemberPage.reportStolen(editMemberPage.getCards().get(1)).then(function () {
                  expect(editMemberPage.newCardButtonPresent()).toBeTruthy();
                  editMemberPage.startCreateCard().then(function () {
                    protractor.dbHelper.addRejectionCard('0102').then(function () {
                      editMemberPage.refreshCardID().then(function () {
                        editMemberPage.submitNewCard().then(function () {
                          expect(editMemberPage.getCards().count()).toEqual(3);
                          expect(editMemberPage.newCardButtonPresent()).toBeFalsy();
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
    });
  });

  describe("Adding to a group", function () {
    var groupExpiry;
    beforeAll(function () {
      return membersPage.get().then(function () {
        return membersPage.setSearchInput('admin_member_0@test.com').then(function () {
          return membersPage.getMemberExpiration(membersPage.getMembers().first()).then(function (expiry) {
            groupExpiry = expiry;
            return membersPage.setSearchInput(targetUser.email).then(function () {
              return membersPage.expandMember(membersPage.getMembers().first());
            })
          });
        });
      });
    });
    it("Adding to group changes member's expiration to group exp", function () {
      expect(editMemberPage.getExpiry()).not.toEqual(groupExpiry);
      editMemberPage.setGroup('Fake Group 1').then(function  () {
        editMemberPage.submit().then(function () {
          expect(editMemberPage.getExpiry()).toEqual(groupExpiry);
        });
      });
    });
  });

  describe("Promoting to admin", function () {
    beforeAll(function () {
      return membersPage.get().then(function () {
        return membersPage.setSearchInput(targetUser.email).then(function () {
          return membersPage.expandMember(membersPage.getMembers().first()).then(function () {
            return editMemberPage.showRoleForm();
          })
        });
      });
    });
    it("Member can be promoted to admin", function () {
      editMemberPage.setRole('admin').then(function () {
        editMemberPage.submit().then(function () {
          protractor.authHelper.logout().then(function () {
            protractor.authHelper.loginUser(targetUser).then(function () {
              expect(headerPage.linkAvailable('membership'));
            });
          })
        });
      });
    });
  });
});
