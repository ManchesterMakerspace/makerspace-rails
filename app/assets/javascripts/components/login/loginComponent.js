app.component('loginComponent', {
  templateUrl: 'components/login/_login.html',
  controller: loginController,
  controllerAs: "loginCtrl"
});

function loginController(Auth, $state, alertService, ipCookie) {
  var loginCtrl = this;
  loginCtrl.$onInit = function() {};

  loginCtrl.submitLogin = function(form){
    if(!form){return;}
    Auth.login(loginCtrl.loginForm).then(function() {
      alertService.addAlert('Logged In!', 'success');
      if (ipCookie("redirect_after_login")) {
        console.log(ipCookie("redirect_after_login").state);
          // $state.go(ipCookie("redirect_after_login").state,            ipCookie("redirect_after_login").params).then(function () {
          //     ipCookie.remove("redirect_after_login", {path: '/'});
          // });
      } else {
        $state.go('root.members');
      }
    }).catch(function(error) {
      alertService.addAlert('Invalid credentials. Please try again', 'danger');
      console.log(error);
        // Authentication failed...
    });
  };

  loginCtrl.resetPassword = function(){
    $state.go('passwordReset');
  };
}
