app.component('inviteComponent', {
  templateUrl: 'components/invite/_invite.html',
  controller: inviteController,
  controllerAs: "inviteCtrl"
});

function inviteController($stateParams, tokenService, alertService, $state) {
  var inviteCtrl = this;
  inviteCtrl.$onInit = function() {
    inviteCtrl.memberEmail = $stateParams.email;
  };

  inviteCtrl.inviteMember = function(){
    tokenService.inviteMember(inviteCtrl.memberEmail).then(function(){
      alertService.addAlert("Registration Email sent to " + inviteCtrl.memberEmail, "success");
      $state.go('root.members');
    }).catch(function(err) {
      console.log(err);
      alertService.addAlert("Error sending Registration", "danger");
      if(err.data && err.data.msg) {
        alertService.addAlert(err.data.msg, "danger")
      }
    });
  };

  inviteCtrl.cancel = function() {
    $state.go('root.memberships.renew');
  };
}
