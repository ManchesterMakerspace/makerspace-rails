app.component('eSignComponent', {
  templateUrl: 'components/eSign/_eSign.html',
  controller: eSignController,
  controllerAs: "signCtrl",
  bindings: {
    signContact: '&'
  }
});

function eSignController() {
  var signCtrl = this;
  signCtrl.$onInit = function() {};

  signCtrl.done = function(){
    var signature = signCtrl.accept();
    if (!signature.isEmpty){
      signCtrl.signContact({signature: signature});
    }
  };
}
