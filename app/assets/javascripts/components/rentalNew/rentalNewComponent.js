app.component('rentalNewComponent', {
  templateUrl: 'components/rentalNew/_rentalNew.html',
  controller: rentalNewController,
  controllerAs: "rentalNewCtrl"
});

function rentalNewController() {
  var rentalNewCtrl = this;
  rentalNewCtrl.$onInit = function() {
  };
}
