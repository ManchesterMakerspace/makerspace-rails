app.component('eSignComponent', {
  templateUrl: 'components/eSign/_eSign.html',
  controller: eSignController,
  controllerAs: "signCtrl",
  bindings: {
    name: '<',
    signContact: '&',
    documents: '<'
  }
});

function eSignController($templateCache, $filter) {
  var signCtrl = this;
  signCtrl.$onInit = function() {
    var now = $filter('date')(new Date(), 'longDate');
    signCtrl.type = 'conduct';
    signCtrl.documents.contract = signCtrl.documents.contract.replace('[name]', '<b>' + signCtrl.name + '</b>');
    signCtrl.documents.contract = signCtrl.documents.contract.replace('[today]', '<b>' + now + '</b>');
    $templateCache.put('contract', signCtrl.documents.contract);
    $templateCache.put('conduct', signCtrl.documents.conduct);
  };

  signCtrl.done = function(){
    var signature = signCtrl.accept();
    if (!signature.isEmpty){
      signCtrl.signContact({signature: signature});
    }
  };
}
