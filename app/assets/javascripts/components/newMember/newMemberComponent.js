app.component('newMemberComponent', {
  templateUrl: 'components/newMember/_newMember.html',
  controller: newMemberController,
  controllerAs: "newMemberCtrl",
  bindings: {
    card: '<'
  }
});

function newMemberController() {
  var newMemberCtrl = this;
  newMemberCtrl.$onInit = function() {
    console.log(newMemberCtrl.card)
  };
}
