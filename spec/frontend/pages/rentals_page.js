var RentalPage = function () {
  var rentalSortFilter = element(by.model("rentalsCtrl.sortBy"));
  var rentalSortOptions = element.all(by.css(".sort-option"));
  var sortDirectionToggle = element(by.model("rentalsCtrl.reverseSort"));

  var rentals = element.all(by.repeater("rental in rentalsCtrl.rentals"));
  var rentalNumber = element(by.binding("rental.number"));
  var rentalMember = element(by.css(".member-name"));
  var rentalExpiration = element(by.binding("rental.expiration"));
  var editRentalButton = element(by.css('a[ui-sref="root.rentals.edit({id: rental.id})"]'));
  var page = this;
  var createRentalButton = element(by.css('a[ui-sref="root.rentals.new"]'));
  var url = browser.baseUrl + 'rentals';
  this.get = function () {
    return browser.get(url);
  };
  this.getUrl = function () {
    return url;
  };
  this.getSortFilter = function () {
    return rentalSortFilter.getText();
  };
  this.setSortOption = function (option) {
    return rentalSortFilter.click().then(function () {
      return browser.sleep(500).then(function () {
        return rentalSortOptions.filter(function (opt) {
          return opt.getText().then(function (text) {
            return text.toLowerCase() === option.toLowerCase();
          });
        }).first().click();
      });
    });
  };
  this.findInTable = function (search) {
    return rentals.filter(function (r) {
      if(search.number) {
        return page.getRentalNumber(r).then(function (num) {
          return num.toLowerCase() === search.number.toLowerCase();
        });
      }
    }).then(function (filteredByNumber) {
      return filteredByNumber.filter(function (r) {
        if(search.member) {
          return page.getMemberName(r).then(function (name) {
            return name.toLowerCase() === search.member.toLowerCase();
          });
        }
      });
    });
  };
  this.toggleSortDirection = function () {
    return sortDirectionToggle.click();
  };
  this.getSortDirectionToggle = function () {
    return protractor.cssHelper.hasClass(sortDirectionToggle, 'md-checkbox');
  };
  this.getRentals = function () {
    return rentals;
  };
  this.getRentalNumber = function (rental) {
    return rental.element(rentalNumber.locator()).getText();
  };
  this.getMemberName = function (rental) {
    return rental.element(rentalMember.locator()).getText();
  };
  this.getRentalExpiration = function (rental) {
    return rental.element(rentalExpiration.locator()).getText();
  };
  this.openEditRental = function (rental) {
    return rental.element(editRentalButton.locator()).click();
  };
  this.openCreateRental = function () {
    return createRentalButton.click();
  };
  this.getRentalAttr = function (name, row) {
    var el = eval("rental" + name);
    return row.element(el.locator()).getText();
  };
  this.verifyTableSort = function (column) {
    function compareNumbers(a, b) {
      if (!isNaN(a)){
        return b.localeCompare(a, undefined, {numeric: true})
      } else {
        return parseInt(b) - parseInt(a);
      }
    }
    return page.setSortOption(column).then(function () {
      return rentals.map(function (r) {
        return page.getRentalAttr(column, r).then(function (val) {
          return val;
        });
      }).then(function (sortValues) {
        return page.getSortDirectionToggle().then(function (desc) {
          if (!desc) {
            expect(sortValues).toEqual(sortValues.slice().sort(compareNumbers));
          } else {
            expect(sortValues).toEqual(sortValues.slice().sort(compareNumbers).reverse());
          }
          return page.toggleSortDirection().then(function () {
            return rentals.map(function (r) {
              return page.getRentalAttr(column, r).then(function (val) {
                return val;
              });
            }).then(function (sortValues) {
              return page.getSortDirectionToggle().then(function (desc) {
                if (!desc) {
                  expect(sortValues).toEqual(sortValues.slice().sort(compareNumbers));
                } else {
                  expect(sortValues).toEqual(sortValues.slice().sort(compareNumbers).reverse());
                }
              });
            });
          });
        });
      });
    });
  };
};

module.exports = RentalPage;
