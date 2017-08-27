app.component('registerComponent', {
  templateUrl: 'components/register/_register.html',
  controller: registerController,
  controllerAs: "registerCtrl",
  bindings: {
    groups: '<',
    token: '<'
  }
});

function registerController(Auth, $state, slackService, alertService, $timeout) {
  var registerCtrl = this;
  registerCtrl.$onInit = function() {
    registerCtrl.signedContact = false;
    registerCtrl.registerForm = {};
  };

  registerCtrl.registerMember = function(form){
    if(!form){return;}
    registerCtrl.registerForm.token = registerCtrl.token.token;
    registerCtrl.registerForm.token_id = registerCtrl.token.id;
    registerCtrl.registerForm.renewal = {
      months: 1,
      start_date: new Date()
    };
    Auth.register(registerCtrl.registerForm). then(function(){
      slackService.connect();
      return $timeout(function(){
        slackService.invite(registerCtrl.registerForm.email, registerCtrl.registerForm.fullname);
        slackService.disconnect();
      }, 500).then(function(){
        alertService.addAlert('Registration Complete!', 'success');
        $state.go('root.members');
      }).catch(function(err){
        console.log(err);
        alertService.addAlert("Error inviting to Slack!", "danger");
      });
    }).catch(function(err){
      console.log(err);
      alertService.addAlert('Error registering. Please contact board@manchestermakerspace.org!', 'danger');
    });
  };

  registerCtrl.signContract = function(signature){
    if(signature.dataUrl) {
      registerCtrl.registerForm.signature = signature.dataURL;
      registerCtrl.signedContact = true;
    }
  };
}
