app.factory('alertService', function(){
  var alerts = [];

  var getAlerts = function(){
    return alerts;
  };

  var addAlert = function(msg, status, alertTimeout) {
    if(!msg){ return; }
    alertTimeout = alertTimeout || 4000;
    alerts.push({type: status, msg: msg, timeout: alertTimeout});
  };

  var closeAlert = function(alert){
    var index = alerts.indexOf(alert);
    if(index !== -1){
      alerts.splice(index, 1);
    }
  };

  return {
    getAlerts: getAlerts,
    addAlert: addAlert,
    closeAlert: closeAlert
  };
});
