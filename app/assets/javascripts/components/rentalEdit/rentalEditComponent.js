app.component('rentalEditComponent', {
  templateUrl: 'components/rentalEdit/_rentalEdit.html',
  controller: rentalEditController,
  controllerAs: "rentalEditCtrl",
  bindings: {
    rental: '<'
  }
});

function rentalEditController() {
  var rentalEditCtrl = this;
  rentalEditCtrl.$onInit = function() {
  };
}
