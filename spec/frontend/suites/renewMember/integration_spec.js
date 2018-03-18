describe("Integration tests for Member Renewal", function () {
  var renewMemberPage = new RenewMemberPage();
  var membersPage = new MembersPage();
  var membershipPage = new MembershipsPage();
  var headerPage = new HeaderPage();
  var currentUser  = protractor.authHelper.adminUsers.user1;
  var targetMember = protractor.authHelper.basicUsers.user1;

  var getMemberExpiry = function () {
    return membersPage.get().then(function () {
      return membersPage.setSearchInput(targetMember.email).then(function () {
        return membersPage.getMemberExpiration(membersPage.getMembers().first());
      });
    });
  };

  beforeAll(function () {
    return protractor.authHelper.loginUser(currentUser).then(function () {
      return getMemberExpiry().then(function (expiry) {
        targetMember.expiry = expiry;
      });
    });
  });

  describe("Traditional navigation", function () {
    it("Can be navigated to through header", function () {
      return headerPage.goToLink('membership').then(function () {
        expect(membershipPage.onNewMemberTab()).toBeTruthy();
        return membershipPage.goRenewMemberTab().then(function () {
          expect(membershipPage.onRenewMemberTab()).toBeTruthy();
        });
      });
    });
    it("Does not have a member selected", function () {
      expect(renewMemberPage.getMemberName()).toBeFalsy();
    });
    it("Has a dropdown of selectable members", function () {
      expect(renewMemberPage.getMemberOptions().count()).toBeGreaterThan(0);
    });
    it("Selecting member loads member's info into view", function () {
      renewMemberPage.setMember(targetMember.fullname).then(function () {
        expect(renewMemberPage.getMemberName()).toEqual(targetMember.fullname);
        expect(renewMemberPage.getMemberExpiry()).toEqual(targetMember.expiry);
      });
    });
    it("Has a dropdown of number of months", function () {
      expect(renewMemberPage.getMonthOptions().count()).toEqual(12);
    });
    it("Renewed member appears in list of updated members with updated info", function () {
      expect(membershipPage.getUpdatedMembers().count()).toEqual(0);
      renewMemberPage.setRenewal(1).then(function () {
        renewMemberPage.submit().then(function () {
          expect(membershipPage.getUpdatedMembers().count()).toEqual(1);
          expect(membershipPage.getMemberName(membershipPage.getUpdatedMembers().first())).toEqual(targetMember.fullname)
          membershipPage.getMemberExpiry(membershipPage.getUpdatedMembers().first()).then(function (expiry) {
            expect(new Date(expiry).getTime()).toBeGreaterThan(new Date(targetMember.expiry).getTime());
          });
        });
      });
    });
    it("updated expiry can be verified on members page", function () {
      getMemberExpiry().then(function (expiry) {
          expect(new Date(expiry).getTime()).toBeGreaterThan(new Date(targetMember.expiry).getTime());
      });
    });
  });
  describe("Url shortcut", function () {
    var url, id;
    beforeAll(function () {
      return getMemberExpiry().then(function (expiry) {
        targetMember.expiry = expiry;
        return membersPage.expandMember(membersPage.getMembers().first()).then(function () {
          return browser.getCurrentUrl().then(function (editUrl) {
            var parts = editUrl.split("/");
            id = parts[parts.length - 1];
            url = renewMemberPage.getUrl() + "/" + id;
          });
        });
      });
    });
    it("Url navs to renew page", function () {
      browser.get(url).then(function () {
        expect(browser.getCurrentUrl()).toEqual(renewMemberPage.getUrl() + "/" + id);
      });
    });
    it("Preselects member in dropdown and fills info", function () {
      expect(renewMemberPage.getMember()).toEqual(targetMember.fullname);
      expect(renewMemberPage.getMemberName()).toEqual(targetMember.fullname);
      expect(renewMemberPage.getMemberExpiry()).toEqual(targetMember.expiry);
    });
    it("Renew is successful and adds to updated members list", function () {
      expect(membershipPage.getUpdatedMembers().count()).toEqual(0);
      renewMemberPage.setRenewal(1).then(function () {
        renewMemberPage.submit().then(function () {
          return browser.wait(function () {
            return protractor.pageHelper.alertsPresent().then(function (p) {
              return p;
            });
          }, 5000).then(function () {
            expect(membershipPage.getUpdatedMembers().count()).toEqual(1);
            expect(membershipPage.getMemberName(membershipPage.getUpdatedMembers().first())).toEqual(targetMember.fullname)
            membershipPage.getMemberExpiry(membershipPage.getUpdatedMembers().first()).then(function (expiry) {
              expect(new Date(expiry).getTime()).toBeGreaterThan(new Date(targetMember.expiry).getTime());
            });
          });
        });
      });
    });
  });
});
