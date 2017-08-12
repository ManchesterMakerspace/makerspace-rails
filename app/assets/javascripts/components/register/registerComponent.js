app.component('registerComponent', {
  templateUrl: 'components/register/_register.html',
  controller: registerController,
  controllerAs: "registerCtrl"
});

function registerController() {
  var registerCtrl = this;
  registerCtrl.$onInit = function() {
  };
}
