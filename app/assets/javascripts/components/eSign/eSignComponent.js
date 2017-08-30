app.component('eSignComponent', {
  templateUrl: 'components/eSign/_eSign.html',
  controller: eSignController,
  controllerAs: "signCtrl",
  bindings: {
    name: '<',
    signContact: '&',
    contract: '<'
  }
});

function eSignController($templateCache, $filter) {
  var signCtrl = this;
  signCtrl.$onInit = function() {
    var now = $filter('date')(new Date(), 'longDate');
    signCtrl.contract = signCtrl.contract.replace('[name]', signCtrl.name);
    signCtrl.contract = signCtrl.contract.replace('[today]', now);
    $templateCache.put('contract', signCtrl.contract);
  };

  signCtrl.done = function(){
    var signature = signCtrl.accept();
    if (!signature.isEmpty){
      signCtrl.signContact({signature: signature});
    }
  };
}
