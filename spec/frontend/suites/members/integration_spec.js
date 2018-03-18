describe("Integration test for Members", function () {
  var membersPage = new MembersPage();
  var memberEditPage = new EditMemberPage();
  var basicUser = protractor.authHelper.basicUsers.user1;
  var adminUser = protractor.authHelper.adminUsers.user1;

  var basicSpec = function () {
    it("Displays no members initially", function () {
      expect(membersPage.getMembers().count()).toEqual(0);
    });
    it("View all only shows active members", function () {
      expect(membersPage.getMembers().count()).toEqual(0);
      membersPage.toggleViewAll().then(function () {
        expect(membersPage.getMembers().count()).toBeGreaterThan(0);
        membersPage.getAllMemberNames().then(function (memberNames) {
          memberNames.forEach(function (name) {
            expect(name).not.toMatch(/Expired/);
          });
        });
      });
    });
    it("Active Members can be searched for", function () {
      var searchTerm = 'Admin Member1';
      membersPage.setSearchInput(searchTerm).then(function () {
        expect(membersPage.getMembers().count()).toEqual(1);
        var member = membersPage.getMembers().get(0);
        expect(membersPage.getMemberName(member)).toEqual(searchTerm);
      });
    });
    it("Expired Members cannot be searched for", function () {
      var searchTerm = 'Expired Member1';
      membersPage.setSearchInput(searchTerm).then(function () {
        expect(membersPage.getMembers().count()).toEqual(0);
      });
    });
    it("Clicking a member does not open the member edit page", function () {
      membersPage.setSearchInput("").then(function () {
        expect(membersPage.getMembers().count()).toBeGreaterThan(0);
        member = membersPage.getMembers().get(0);
        membersPage.expandMember(member).then(function () {
          expect(browser.getCurrentUrl()).toEqual(membersPage.getUrl());
        });
      });
    });
  };

  beforeAll(function () {
    return membersPage.get();
  });
  describe("Unauthed", function () {
    basicSpec();
  });
  describe("For basic users", function () {
    beforeAll(function () {
      return protractor.authHelper.loginUser(basicUser);
    });
    basicSpec();
  });

  describe("For admin users", function () {
    beforeAll(function () {
      return protractor.authHelper.loginUser(adminUser);
    });
    it("Displays no members initially", function () {
      expect(membersPage.getMembers().count()).toEqual(0);
    });
    it("can view all members", function () {
      expect(membersPage.getMembers().count()).toEqual(0);
      membersPage.toggleViewAll().then(function () {
        expect(membersPage.getMembers().count()).toBeGreaterThan(0);
        membersPage.getAllMemberNames().then(function (memberNames) {
          var counts = {
            expired: 0,
            basic: 0,
            admin: 0
          };
          memberNames.forEach(function (name) {
            if(name.includes('Expired')){
              counts.expired ++;
            } else if (name.includes('Admin')) {
              counts.admin ++;
            } else if (name.includes("Basic")) {
              counts.basic ++;
            }
          });
          expect(counts.expired).toBeGreaterThan(0);
          expect(counts.admin).toBeGreaterThan(0);
          expect(counts.basic).toBeGreaterThan(0);
        });
      });
    });
    it("Can search for any member", function () {
      var adminSearch = 'Admin Member1';
      var expiredSearch = 'Expired Member1';
      membersPage.setSearchInput(adminSearch).then(function () {
        expect(membersPage.getMembers().count()).toBeGreaterThan(0);
        var member = membersPage.getMembers().get(0);
        expect(membersPage.getMemberName(member)).toEqual(adminSearch);
        membersPage.setSearchInput(expiredSearch).then(function () {
          expect(membersPage.getMembers().count()).toBeGreaterThan(0);
          member = membersPage.getMembers().get(0);
          expect(membersPage.getMemberName(member)).toEqual(expiredSearch);
        });
      });
    });
    it("Clicking a member opens the member edit page", function () {
      expect(membersPage.getMembers().count()).toBeGreaterThan(0);
      var member = membersPage.getMembers().get(0);
      membersPage.expandMember(member).then(function () {
        expect(browser.getCurrentUrl()).toMatch(/members\/[0-9]+/);
      });
    });
  });
});
