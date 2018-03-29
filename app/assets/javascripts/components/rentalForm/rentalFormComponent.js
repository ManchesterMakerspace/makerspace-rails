app.component('rentalFormComponent', {
  templateUrl: 'components/rentalForm/_rentalForm.html',
  controller: rentalFormController,
  controllerAs: "rentalFormCtrl",
  bindings: {
    rental: '<',
    upsertRental: '&',
    rentals: '<',
    members: '<',
    deleteRental: '&'
  }
});

function rentalFormController(rentalsService, $state, $filter, alertService) {
  var rentalFormCtrl = this;
  rentalFormCtrl.$onInit = function() {
    rentalFormCtrl.rentalForm = {};
    rentalFormCtrl.currentNumbers = rentalFormCtrl.rentals.map(function (r) {
      return r.number;
    });

    if(!!rentalFormCtrl.rental) {
      angular.copy(rentalFormCtrl.rental, rentalFormCtrl.rentalForm);
      rentalFormCtrl.rentalForm.member_id = $filter('filter')(rentalFormCtrl.members, {id: rentalFormCtrl.rental.member.id})[0].id;
      rentalFormCtrl.rentalForm.expiration = new Date(rentalFormCtrl.rental.expiration);
    }
  };

  rentalFormCtrl.submitForm = function(form){
    if(!form){return;}
    return rentalFormCtrl.upsertRental({rental: rentalFormCtrl.rentalForm}).then(function(){
      alertService.addAlert('Rental saved!', 'success');
      $state.go('root.rentals');
    }).catch(function(err){
      console.log(err);
    });
  };

  rentalFormCtrl.delete = function(){
    if(confirm('Are you sure you want to delete this?')) {
      return rentalFormCtrl.deleteRental({rental: rentalFormCtrl.rental}).then(function(){
        alertService.addAlert('Rental deleted!', 'info');
        $state.go('root.rentals');
      }).catch(function(){
        alertService.addAlert('Error deleting rental', 'danger');
      });
    }
  };

  rentalFormCtrl.exitForm = function(){
    $state.go('root.rentals');
  };
}
