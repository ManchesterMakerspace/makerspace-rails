var MembershipsPage = function () {
  var wrapper = element(by.css("memberships-component"))
  var newMemberTab = wrapper.element(by.css('a[ui-sref="root.admin.memberships.new"]'));
  var renewMemberTab = wrapper.element(by.css('a[ui-sref="root.admin.memberships.renew"]'));

  var updatedMembers = wrapper.all(by.repeater("member in membershipCtrl.updatedMembers"));
  var memberName = element(by.binding("member.firstname + ' ' + member.lastname"));
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
