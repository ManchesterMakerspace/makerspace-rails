app.component('rentalsComponent', {
  templateUrl: 'components/rentals/_rentals.html',
  controller: rentalsController,
  controllerAs: "rentalCtrl",
  bindings: {
    rentals: '<',
    isUserAdmin: '<'
  }
});

function rentalsController() {
  var rentalCtrl = this;
  rentalCtrl.$onInit = function() {
  };

  rentalCtrl.checkExp = function(rental){
    var today = new Date();
    var expTime = new Date(rental.expiration);
    return expTime - today > 0;
  };
}
