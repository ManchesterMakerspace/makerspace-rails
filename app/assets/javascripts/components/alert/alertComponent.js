app.component('alertComponent', {
  templateUrl: 'components/alert/_alert.html',
  controller: alertController,
  controllerAs: "alertCtrl"
});

function alertController(alertService) {
  var alertCtrl = this;
  alertCtrl.$onInit = function() {
    alertCtrl.alerts = alertService.getAlerts();
  };

  alertCtrl.closeAlert = function(alert){
    alertService.closeAlert(alert);
  };
}
