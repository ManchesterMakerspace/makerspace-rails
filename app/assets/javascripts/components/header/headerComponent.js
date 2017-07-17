app.component('headerComponent', {
  templateUrl: 'components/header/_header.html',
  controller: headerController,
  controllerAs: "headerCtrl",
  bindings: {
    currentUser: '<'
  }
});

function headerController(Auth, $state) {
  var headerCtrl = this;
  headerCtrl.$onInit = function() {
  };

  headerCtrl.logout = function(){
    Auth.logout().then(function(){
      $state.go('login');
    });
  };

  headerCtrl.isAdmin = function(){
    return headerCtrl.currentUser.role === 'admin';
  };
}
