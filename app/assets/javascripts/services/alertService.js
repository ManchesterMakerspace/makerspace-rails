app.factory('alertService', function(){
  var alerts = [];

  var getAlerts = function(){
    return alerts;
  };

  var addAlert = function(msg, status) {
    if(!msg){ return; }
    alerts.push({type: status, msg: msg});
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
