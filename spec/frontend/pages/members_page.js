var MemberPage = function () {
  var memberSearchInput = element(by.model("membersCtrl.searchText"));
  var viewAllToggle = element(by.model("membersCtrl.viewAll"));
  var memberSortFilter = element(by.model("membersCtrl.sortBy"));
  var memberSortOptions = element(by.css(".sort-option"));
  var sortDirectionToggle = element(by.model("membersCtrl.reverseSort"));

  var members = element.all(by.repeater("member in membersCtrl.members"));
  var memberName = element(by.binding("member.firstname + ' ' + member.lastname"));
  var memberExpiration = element(by.binding("member.expirationTime"));
  var page = this;
  var url = browser.baseUrl + 'members';
  this.get = function () {
    return browser.get(url);
  };
  this.getUrl = function () {
    return url;
  };

  this.setSearchInput = function (searchText) {
    return memberSearchInput.clear().sendKeys(searchText);
  };
  this.getSearchInput = function () {
    return memberSearchInput.getAttribute('value');
  };
  this.setSortOption = function (option) {
    return memberSortFilter.click().then(function () {
      return memberSortOptions.filter(function (opt) {
        return opt.getText().then(function (text) {
          return text.toLowerCase() === option.toLowerCase();
        });
      }).first().click();
    });
  };
  this.toggleViewAll = function () {
    return viewAllToggle.click();
  };
  this.getViewAllToggle = function () {
    return protractor.cssHelper.hasClass(viewAllToggle, 'md-checkbox');
  };
  this.toggleSortDirection = function () {
    return sortDirectionToggle.click();
  };
  this.getSortDirectionToggle = function () {
    return protractor.cssHelper.hasClass(sortDirectionToggle, 'md-checkbox');
  };
  this.getMembers = function () {
    return members;
  };
  this.getMemberName = function (member) {
    return member.element(memberName.locator()).getText();
  };
  this.getMemberExpiration = function (member) {
    return member.element(memberExpiration.locator()).getText();
  };
  this.expandMember = function (member) {
    return member.element(memberName.locator()).click();
  };
  this.getAllMemberNames = function () {
    return members.map(function (m) {
      return page.getMemberName(m).then(function (name) {
        return name;
      });
    });
  };
};

module.exports = MemberPage;
