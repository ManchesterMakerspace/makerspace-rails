app.component('rootComponent', {
  templateUrl: 'components/root/_root.html',
  controller: rootController,
  controllerAs: "rootCtrl"
});

function rootController() {
  var rootCtrl = this;
  rootCtrl.$onInit = function() {
  };
}
