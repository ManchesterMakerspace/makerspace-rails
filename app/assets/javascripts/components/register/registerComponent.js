app.component('registerComponent', {
  templateUrl: 'components/register/_register.html',
  controller: registerController,
  controllerAs: "registerCtrl",
  bindings: {
    groups: '<'
  }
});

function registerController() {
  var registerCtrl = this;
  registerCtrl.$onInit = function() {
  };
}
