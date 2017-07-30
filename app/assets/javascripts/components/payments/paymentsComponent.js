app.component('paymentsComponent', {
  templateUrl: 'components/payments/_payments.html',
  controller: paymentsController,
  controllerAs: "paymentsCtrl",
  bindings: {
    members: '<',
    payments: '<'
  }
});

function paymentsController() {
  var paymentsCtrl = this;
  paymentsCtrl.$onInit = function() {
    console.log(paymentsCtrl.members);
    console.log(paymentsCtrl.payments);
  };
}
