app.component('registerComponent', {
  templateUrl: 'components/register/_register.html',
  controller: registerController,
  controllerAs: "registerCtrl",
  bindings: {
    groups: '<',
    token: '<',
  }
});

function registerController(Auth, $state, slackService, alertService, $timeout, calendarService, tokenService) {
  var registerCtrl = this;
  registerCtrl.$onInit = function() {
    tokenService.getDocuments().then(function(response){
      registerCtrl.documents = response;
    });
    calendarService.getOrientationTimes().then(function(response){
      registerCtrl.availableTimeSlots = response;
    });
    registerCtrl.step = 0;
    registerCtrl.signedContact = false;
    registerCtrl.completedForm = false;
    registerCtrl.registerForm = {
      email: registerCtrl.token.email
    };
  };

  registerCtrl.getFullname = function () {
    return registerCtrl.registerForm.firstname + " " + registerCtrl.registerForm.lastname;
  };

  registerCtrl.registerMember = function(){
    registerCtrl.registerForm.token = registerCtrl.token.token;
    registerCtrl.registerForm.token_id = registerCtrl.token.id;
    registerCtrl.registerForm.role = registerCtrl.token.role;
    Auth.register(registerCtrl.registerForm). then(function(){
      slackService.connect();
      return $timeout(function(){
        slackService.invite(registerCtrl.registerForm.email, registerCtrl.getFullname());
      }, 500).then(function(){
          alertService.addAlert('Registration Complete!', 'success');
          $state.go('root.members');
      }).catch(function(err){
        console.log(err);
        alertService.addAlert("Error inviting to Slack!", "danger", 8000);
      });
    }).catch(function(err){
      console.log(err);
      alertService.addAlert('Error registering. Please contact amanda.lambert@manchestermakerspace.org!', 'danger', 8000);
    });
  };

  registerCtrl.selectTimeslot = function(){
    if(!registerCtrl.timeSlot) {return;}
    var details = {
      event: registerCtrl.timeSlot,
      attendee: {email: registerCtrl.registerForm.email}
    };
    calendarService.assignOrientation(details).then(function(){
      alertService.addAlert('Orientation Confirmed!', 'success');
      $state.go('root.members');
    });
  };

  registerCtrl.signContract = function(signature){
    if(signature.dataUrl) {
      alertService.addAlert('Saving...');
      registerCtrl.registerForm.signature = signature.dataUrl;
      registerCtrl.registerMember();
    } else {
      alertService.addAlert("Please sign the Member Contract before proceeding.");
    }
  };

  registerCtrl.submitForm = function(form){
    if(!form) {return;}
    if(!registerCtrl.documents) {
      tokenService.getDocuments().then(function(response){
        registerCtrl.documents = response;
        registerCtrl.completedForm = true;
      });
    } else {
      registerCtrl.completedForm = true;
    }
  };
}
