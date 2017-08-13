app.component('registerComponent', {
  templateUrl: 'components/register/_register.html',
  controller: registerController,
  controllerAs: "registerCtrl",
  bindings: {
    groups: '<',
    token: '<'
  }
});

function registerController(Auth, $state) {
  var registerCtrl = this;
  registerCtrl.$onInit = function() {
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
      $state.go('root.members');
    }).catch(function(err){
      console.log(err);
    });
  };
}
