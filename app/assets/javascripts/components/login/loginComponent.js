app.component('loginComponent', {
  templateUrl: 'components/login/_login.html',
  controller: loginController,
  controllerAs: "loginCtrl"
});

function loginController(Auth, $state) {
  var loginCtrl = this;
  loginCtrl.$onInit = function() {};

  loginCtrl.submitLogin = function(form){
    if(!form){return;}
    Auth.login(loginCtrl.loginForm).then(function() {
      return $state.go('root.members');
    }, function(error) {
      console.log(error);
        // Authentication failed...
    });
  };
}
