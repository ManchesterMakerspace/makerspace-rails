describe("Integration spec for rentals", function () {
  var rentalsPage = new RentalsPage();
  var headerPage = new HeaderPage();
  var rentalFormPage = new RentalFormPage();

  beforeAll(function () {
    return browser.get(browser.baseUrl);
  });

  describe("Unauthed", function () {
    it("Cannot be navigated to", function () {
      rentalsPage.get().then(function () {
        expect(browser.getCurrentUrl()).not.toEqual(rentalsPage.getUrl());
      });
    });
  });

  describe("Authed", function () {
    describe("Basic User", function () {
      it("Can be navigated to after logging in", function () {
        protractor.authHelper.loginUser(protractor.authHelper.basicUsers.user1).then(function () {
          rentalsPage.get().then(function () {
            expect(browser.getCurrentUrl()).toEqual(rentalsPage.getUrl());
          });
        });
      });
    });
    describe("Admin", function () {
      beforeAll(function () {
        return protractor.authHelper.loginUser(protractor.authHelper.adminUsers.user1);
      });
      it("Can be navigated to", function () {
        headerPage.goToLink('rentals').then(function () {
          expect(browser.getCurrentUrl()).toEqual(rentalsPage.getUrl());
          headerPage.goToLink('members').then(function () {
            expect(browser.getCurrentUrl()).not.toEqual(rentalsPage.getUrl());
            rentalsPage.get().then(function () {
              expect(browser.getCurrentUrl()).toEqual(rentalsPage.getUrl());
            });
          });
        });
      });
      it("Displays a list of rentals", function () {
        expect(rentalsPage.getRentals().count()).toBeGreaterThan(0);
      });
      it("list can be sorted by rental number, member name, or expiry", function () {
        rentalsPage.verifyTableSort('Number');
        rentalsPage.verifyTableSort('Member');
        rentalsPage.verifyTableSort('Expiration');
      });
      it("Create rental button opens create form", function () {
        rentalsPage.openCreateRental().then(function () {
          expect(browser.getCurrentUrl()).toEqual(rentalFormPage.getUrl());
          rentalsPage.get().then(function () {
            expect(browser.getCurrentUrl()).toEqual(rentalsPage.getUrl());
          });
        });
      });
      it("Edit rental button opens edit form", function () {
        rentalsPage.openEditRental(rentalsPage.getRentals().get(0)).then(function () {
          expect(browser.getCurrentUrl()).toMatch(/rentals\/[0-9]+/);
          rentalsPage.get().then(function () {
            expect(browser.getCurrentUrl()).toEqual(rentalsPage.getUrl());
          });
        });
      });
    });
  });
});
