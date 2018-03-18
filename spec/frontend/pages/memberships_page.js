var MembershipsPage = function () {
  var newMemberTab = element(by.css('a[ui-sref="root.admin.memberships.new"]'));
  var renewMemberTab = element(by.css('a[ui-sref="root.admin.memberships.renew"]'));

  var updatedMembers = element.all(by.repeater("member in membershipCtrl.updatedMembers"));
  var memberName = element(by.binding("member.fullname"));
  var memberExpiry = element(by.binding("member.expirationTime"));

  this.goNewMemberTab = function () {
    return newMemberTab.click();
  };
  this.onNewMemberTab = function () {
    return protractor.cssHelper.hasClass(newMemberTab, 'active');
  };
  this.goRenewMemberTab = function () {
    return renewMemberTab.click();
  };
  this.onRenewMemberTab = function () {
    return protractor.cssHelper.hasClass(renewMemberTab, 'active');
  };
  this.getUpdatedMembers = function () {
    return updatedMembers;
  };
  this.getMemberName = function (member) {
    return member.element(memberName.locator()).getText();
  };
  this.getMemberExpiry = function (member) {
    return member.element(memberExpiry.locator()).getText();
  };
};

module.exports = MembershipsPage;
