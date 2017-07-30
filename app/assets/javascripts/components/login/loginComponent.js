app.component('loginComponent', {
  templateUrl: 'components/login/_login.html',
  controller: loginController,
  controllerAs: "loginCtrl"
});

function loginController(Auth, $state, memberService) {
  var loginCtrl = this;
  loginCtrl.$onInit = function() {};

  loginCtrl.submitLogin = function(form){
    if(!form){return;}
    Auth.login(loginCtrl.loginForm).then(function(user) {
      memberService.setMember(user);
      return $state.go('members');
    }, function(error) {
      console.log(error);
        // Authentication failed...
    });
  };
}
