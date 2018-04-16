var alerts = element.all(by.repeater("alert in alertCtrl.alerts"));
exports.getAlerts = function () {
  return alerts;
};
exports.alertsPresent = function () {
  return protractor.pageHelper.isDisplayed(alerts);
};
exports.clearAlerts = function () {
  return alerts.each(function (a) {
    return a.element(by.css("button")).click();
  });
};
exports.getErrorAlerts = function () {
  return alerts.filter(function (a) {
    return protractor.cssHelper.hasClass(a, 'alert-danger').then(function (t) {
      return t;
    });
  });
};
exports.getSuccessAlerts = function () {
  return alerts.filter(function (a) {
    return protractor.cssHelper.hasClass(a, 'alert-success').then(function (t) {
      return t;
    });
  });
};
exports.isDisplayed = function (element) {
    return element.isPresent().then(function(p) {
        if(p) {
            return element.isDisplayed();
        } else {
            return Promise.resolve(p);
        }
    });
};
exports.scrollToOption = function(element){
    return browser.executeScript('arguments[0].scrollIntoView(false)', element);
};
exports.scrollTopWithPadding = function(element){
    return element.getLocation().then(function(loc){
        var posY = loc.y - 70;
        var posX = loc.x;
        return browser.executeScript('window.scrollTo(arguments[0], arguments[1]);', posX, posY);
    });
};
exports.logErrors = function(){
    return browser.manage().logs().get('browser').then(function(browserLogs){
        browserLogs.forEach(function(log){
            if (log.level.value > 900) { // it's an error log
                console.log('Browser console error!');
                console.log(log.message);
            }
        });
    });
};

exports.inputValid = function (el) {
  return protractor.cssHelper.hasClass(el, "ng-valid");
};
