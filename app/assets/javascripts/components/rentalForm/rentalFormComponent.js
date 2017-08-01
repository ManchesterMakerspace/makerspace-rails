app.component('rentalFormComponent', {
  templateUrl: 'components/rentalForm/_rentalForm.html',
  controller: rentalFormController,
  controllerAs: "rentalFormCtrl",
  bindings: {
    rental: '<',
    upsertRental: '&',
    rentals: '<',
    members: '<'
  }
});

function rentalFormController(rentalsService, $state, $filter) {
  var rentalFormCtrl = this;
  rentalFormCtrl.$onInit = function() {
    if(!!rentalFormCtrl.rental) {
      rentalFormCtrl.rentalForm = {};
      angular.copy(rentalFormCtrl.rental, rentalFormCtrl.rentalForm);
      rentalFormCtrl.rentalForm.member_id = $filter('filter')(rentalFormCtrl.members, {id: rentalFormCtrl.rental.member.id})[0].id;
    }
  };

  rentalFormCtrl.submitForm = function(form){
    if(!form){return;}
    return rentalFormCtrl.upsertRental({rental: rentalFormCtrl.rentalForm}).then(function(){
      $state.go('root.rentals');
    }).catch(function(err){
      console.log(err);
    });
  };

  rentalFormCtrl.exitForm = function(){
    $state.go('root.rentals');
  };
}
