app.component('passwordComponent', {
  templateUrl: 'components/password/_password.html',
  controller: passwordController,
  controllerAs: "passwordCtrl"
});

function passwordController(Auth, $state, $stateParams, alertService) {
  var passwordCtrl = this;
  passwordCtrl.$onInit = function() {
    passwordCtrl.emailNotFound = false;
    passwordCtrl.failedEmail = '';
    passwordCtrl.token = $stateParams.token;
  };

  passwordCtrl.requestPasswordEmail = function(form, alertService){
    if(!form){return;}
    Auth.sendResetPasswordInstructions(passwordCtrl.passwordForm).then(function() {
      alertService.addAlert('Please check your email for Password Reset Instructions', 'success');
      $state.go('root.members');
    }).catch(function(error) {
      if(error.status === 422){
        passwordCtrl.emailNotFound = true;
        passwordCtrl.failedEmail = passwordCtrl.passwordForm.email;
      } else {
        alertService.addAlert('Error processing request');
      }
    });
  };

  passwordCtrl.changePassword = function(form){
    if(!form){return;}
    passwordCtrl.passwordForm.reset_password_token = passwordCtrl.token;
    Auth.resetPassword(passwordCtrl.passwordForm).then(function(){
      alertService.addAlert('Password changed successfully', 'success');
      return $state.go('root.members');
    }).catch(function(){
      alertService.addAlert('There was an issue changing your password.  Please try again.');
    });
  };
}
