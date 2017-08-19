app.component('rentalsComponent', {
  templateUrl: 'components/rentals/_rentals.html',
  controller: rentalsController,
  controllerAs: "rentalsCtrl",
  bindings: {
    rentals: '<',
    members: '<',
    isUserAdmin: '<'
  }
});

function rentalsController($filter, rentalsService, $q) {
  var rentalsCtrl = this;
  rentalsCtrl.$onInit = function() {
    console.log(rentalsCtrl.rentals);
  };

  rentalsCtrl.checkExp = function(rental){
    var today = new Date();
    var expTime = new Date(rental.expiration);
    return expTime - today > 0;
  };

  rentalsCtrl.upsertRental = function(rental){
    rentalsCtrl.rentalUpdate = rental;
    return rentalsService.upsertRental(rental).then(function(response){
      if(!rentalsCtrl.rentalUpdate.id) {
        rentalsCtrl.rentals.push(response);
      } else {
        var rental = $filter('filter')(rentalsCtrl.rentals, {id: response.id})[0];
        var index = rentalsCtrl.rentals.indexOf(rental);
        rentalsCtrl.rentals[index] = response;
      }
      return response;
    });
  };

  rentalsCtrl.deleteRental = function(rental){
    var foundRental = $filter('filter')(rentalsCtrl.rentals, {id: rental.id})[0];
    var index = rentalsCtrl.rentals.indexOf(foundRental);
    if(index !== -1){
      return rentalsService.deleteRental(rental).then(function(response){
        rentalsCtrl.rentals.splice(index, 1);
        return response;
      });
    } else {
      var deferred = $q.defer();
      deferred.reject('Not found');
      return deferred.promise;
    }
  };
}
