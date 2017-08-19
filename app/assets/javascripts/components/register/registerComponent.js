app.component('registerComponent', {
  templateUrl: 'components/register/_register.html',
  controller: registerController,
  controllerAs: "registerCtrl",
  bindings: {
    groups: '<',
    token: '<'
  }
});

function registerController(Auth, $state, slackService, alertService) {
  var registerCtrl = this;
  registerCtrl.$onInit = function() {
    registerCtrl.signedContact = false;
    console.log(registerCtrl.token);
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
      slackService.invite(registerCtrl.registerForm.email, registerCtrl.registerForm.fullname);
      slackService.disconnect();
      alertService.addAlert('Registration Complete!', 'success');
      $state.go('root.members');
    }).catch(function(err){
      console.log(err);
    });
  };

  registerCtrl.signContract = function(signature){
    console.log(signature.dataUrl);
    registerCtrl.signedContact = true;
  };
}
