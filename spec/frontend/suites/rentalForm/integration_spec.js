describe("Integration tests for creating and editing rentals", function () {
  var rentalFormPage = new RentalFormPage();
  var rentalsPage = new RentalsPage();
  var takenNumbers;
  var targetMember = protractor.authHelper.basicUsers.user1;
  var currentUser  = protractor.authHelper.adminUsers.user1;

  beforeAll(function () {
    return protractor.authHelper.loginUser(currentUser).then(function () {
      return rentalsPage.get().then(function () {
        return rentalsPage.getRentals().map(function (r) {
          return rentalsPage.getRentalNumber(r).then(function (num) {
            return num;
          });
        }).then(function (rentalNumbers) {
          takenNumbers = rentalNumbers;
        });
      });
    });
  });

  describe("Creating Rentals", function () {
    var newRental = {
      number: 'new number',
      member: targetMember.firstname + " " + targetMember.lastname
    }
    it("Create Rental button opens form", function () {
      rentalsPage.openCreateRental().then(function () {
        expect(browser.getCurrentUrl()).toEqual(rentalFormPage.getUrl());
      });
    });

    it("Delete button not displayed", function () {
      expect(rentalFormPage.deleteButtonDisplayed()).toBeFalsy();
    });
    it("Number and Member are required", function () {
      rentalFormPage.submit().then(function () {
        expect(rentalFormPage.inputValid('rentalNumber')).toBeFalsy();
        expect(rentalFormPage.inputValid('rentalMember')).toBeFalsy();
      });
    });

    it("Cannot select a number that is already taken", function () {
      rentalFormPage.setInput('rentalNumber', newRental.number).then(function () {
        expect(rentalFormPage.inputValid('rentalNumber')).toBeTruthy();
        rentalFormPage.setInput('rentalNumber', takenNumbers[0]).then(function () {
          expect(rentalFormPage.inputValid('rentalNumber')).toBeFalsy();
        });
      });
    });

    it("Member can be selected from dropdown", function () {
      expect(rentalFormPage.getMemberOptions().count()).toBeGreaterThan(0);
      expect(rentalFormPage.inputValid('rentalMember')).toBeFalsy();
      rentalFormPage.setMember(newRental.member).then(function () {
        expect(rentalFormPage.inputValid('rentalMember')).toBeTruthy();
      });
    });

    it("Can be submitted w/o an expiration date", function () {
      rentalFormPage.setInput('rentalNumber', newRental.number).then(function () {
        rentalFormPage.submit().then(function () {
          expect(browser.getCurrentUrl()).toEqual(rentalsPage.getUrl());
        });
      });
    });
    it("New rental appears in table", function () {
      rentalsPage.findInTable(newRental).then(function (results) {
        expect(results.length).toEqual(1);
        expect(rentalsPage.getRentalExpiration(results[0])).toBeFalsy();
      });
    });

    it("Can be created with an expiration", function () {
      var expiringRental = {
        number: 'exp rental',
        member: targetMember.firstname + " " + targetMember.lastname
      };
      var newDate = new Date(Date.now() + (24 * 60 * 60 * 1000)); //1 day later
      var dateString = newDate.getDate() + " " + newDate.getFullYear();
      var  el = protractor.pageObjectHelper.filterOneByDisplayed(element.all(by.css('td[aria-label$="' + dateString + '"]')));

      rentalsPage.openCreateRental().then(function () {
        rentalFormPage.setInput('rentalNumber', expiringRental.number).then(function () {
          rentalFormPage.setMember(expiringRental.member).then(function () {
            rentalFormPage.openCalendar().then(function () {
              browser.sleep(1000).then(function () {
                el.click().then(function () {
                  rentalFormPage.submit().then(function () {
                    expect(browser.getCurrentUrl()).toEqual(rentalsPage.getUrl());
                    rentalsPage.findInTable(expiringRental).then(function (results) {
                      expect(results.length).toEqual(1);
                      expect(rentalsPage.getRentalExpiration(results[0])).toMatch(new RegExp(dateString.split(" ").join(", ")));
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

  describe("Editing a rental", function () {
    var editingRental = {};
    var changedRental = {
      number: 'changed number',
      member: targetMember.firstname + " " + targetMember.lastname
    };
    var dateString;
    beforeAll(function () {
      var targetRental = rentalsPage.getRentals().first();
      return rentalsPage.getRentalNumber(targetRental).then(function (num) {
        return rentalsPage.getMemberName(targetRental).then(function (name) {
          return rentalsPage.getRentalExpiration(targetRental).then(function (expiry) {
            editingRental = {
              number: num,
              member: name,
              expiration: expiry
            };
          });
        });
      });
    });
    it("Edit button opens form", function () {
      rentalsPage.openEditRental(rentalsPage.getRentals().first()).then(function () {
        expect(browser.getCurrentUrl()).toMatch(/rentals\/[0-9]+/);
      });
    });
    it("Form preloaded with rental details", function () {
      expect(rentalFormPage.getInput('rentalNumber')).toEqual(editingRental.number);
      expect(rentalFormPage.getMember()).toEqual(editingRental.member);
      rentalFormPage.getDateInput().then(function (initExp) {
        expect(new Date(initExp)).toEqual(new Date(editingRental.expiration))
      });
    });
    it("Number can be changed if not taken", function () {
      expect(rentalFormPage.inputValid('rentalNumber')).toBeTruthy();
      rentalFormPage.setInput('rentalNumber', takenNumbers[5]).then(function () {
        browser.sleep(1000).then(function () {
          expect(rentalFormPage.inputValid('rentalNumber')).toBeFalsy();
          rentalFormPage.setInput('rentalNumber', editingRental.number).then(function () {
            browser.sleep(1000).then(function () {
              expect(rentalFormPage.inputValid('rentalNumber')).toBeTruthy();
              rentalFormPage.setInput('rentalNumber', changedRental.number).then(function () {
                browser.sleep(1000).then(function () {
                  expect(rentalFormPage.inputValid('rentalNumber')).toBeTruthy();
                });
              });
            });
          });
        })
      });
    });
    it("Member can be changed", function () {
      expect(rentalFormPage.getMember()).toEqual(editingRental.member);
      expect(rentalFormPage.inputValid('rentalMember')).toBeTruthy();
      rentalFormPage.setMember(changedRental.member).then(function () {
        expect(rentalFormPage.getMember()).toEqual(changedRental.member);
        expect(rentalFormPage.inputValid('rentalMember')).toBeTruthy();
      });
    });
    it("Expiration can be updated", function () {
      var newDate = new Date(new Date(editingRental.expiration) + (24 * 60 * 60 * 1000)); //1 day later
      dateString = newDate.getDate() + " " + newDate.getFullYear();
      var  el = protractor.pageObjectHelper.filterOneByDisplayed(element.all(by.css('td[aria-label$="' + dateString + '"]')));

      rentalFormPage.getDateInput().then(function (initExp) {
        expect(new Date(initExp)).toEqual(new Date(editingRental.expiration));
        rentalFormPage.openCalendar().then(function () {
          browser.sleep(1000).then(function () {
            el.click().then(function () {
              rentalFormPage.getDateInput().then(function (newExp) {
                expect(new Date(newExp)).not.toEqual(new Date(editingRental.expiration));
              });
            });
          });
        });
      });
    });
    it("Updates saved and displayed on rentals table", function () {
      rentalFormPage.submit().then(function () {
        expect(browser.getCurrentUrl()).toEqual(rentalsPage.getUrl());
        rentalsPage.findInTable(changedRental).then(function (results) {
          expect(results.length).toEqual(1);
          expect(rentalsPage.getRentalExpiration(results[0])).toMatch(new RegExp(dateString.split(" ").join(", ")));
          rentalsPage.findInTable(editingRental).then(function (results) {
            expect(results.length).toEqual(0);
          });
        });
      });
    });
  });
  describe("Deleting a rental", function () {
    var deleteRental;
    var EC = protractor.ExpectedConditions;
    beforeAll(function () {
      var targetRental = rentalsPage.getRentals().get(2);
      return rentalsPage.getRentalNumber(targetRental).then(function (num) {
        return rentalsPage.getMemberName(targetRental).then(function (name) {
          return rentalsPage.getRentalExpiration(targetRental).then(function (expiry) {
            deleteRental = {
              number: num,
              member: name,
              expiration: expiry
            };
            return rentalsPage.findInTable(deleteRental).then(function (results) {
              return rentalsPage.openEditRental(results[0]);
            });
          });
        });
      });
    });
    it("Edit form contains delete button", function () {
      expect(rentalFormPage.deleteButtonDisplayed()).toBeTruthy();
    });
    it("Delete button brings up confirmation prompt", function () {
      rentalFormPage.deleteRental().then(function () {
        expect(EC.alertIsPresent()).toBeTruthy();
      });
    });
    it("Cancel alert stays on form page", function () {
      browser.switchTo().alert().dismiss().then(function () {
        expect(browser.getCurrentUrl()).toMatch(/rentals\/[0-9]+/);
      });
    });
    it("Accepting alert deletes rental from table", function () {
      rentalFormPage.deleteRental().then(function () {
        browser.switchTo().alert().accept().then(function () {
          expect(browser.getCurrentUrl()).toEqual(rentalsPage.getUrl());
          rentalsPage.findInTable(deleteRental).then(function (results) {
            expect(results.length).toEqual(0);
          });
        });
      });
    });
  });
});
