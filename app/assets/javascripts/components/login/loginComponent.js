app.component('loginComponent', {
  templateUrl: 'components/login/_login.html',
  controller: loginController,
  controllerAs: "loginCtrl"
});

function loginController($auth) {
  var loginCtrl = this;
  loginCtrl.$onInit = function() {
    console.log('init')
  };

  loginCtrl.submitLogin = function(form){
    console.log(form)
    if(!form){return;}
    console.log(loginCtrl.loginForm)
    $auth.submitLogin(loginCtrl.loginForm);
  };
}
