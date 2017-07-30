app.component('paymentsComponent', {
  templateUrl: 'components/payments/_payments.html',
  controller: paymentsController,
  controllerAs: "paymentsCtrl",
  bindings: {
    members: '<',
    payments: '<'
  }
});

function paymentsController(memberService, paymentsService, $q) {
  var paymentsCtrl = this;
  paymentsCtrl.$onInit = function() {
    paymentsCtrl.payments.forEach(function(payment){
      if(!payment.member) {payment.danger = true;}
      payment.renew = !!payment.member;
      payment.selected = !!payment.member;
      payment.intro = !payment.renew;
      if(!!payment.product){
        payment.months = payment.product.split("-")[0];
        if(!payment.months || !(payment.months > 0)) {payment.danger = true;}
      } else {
        payment.danger = true;
      }
    });
    console.log(paymentsCtrl.members);
    console.log(paymentsCtrl.payments);
  };

  paymentsCtrl.sendSelected = function() {
    var processAll = [];
    angular.forEach(paymentsCtrl.payments, function(payment){
      this.push(paymentsCtrl.processPayment(payment));
    }, processAll);
    $q.all(processAll).then(function(){
      console.log('Success');
    }).catch(function(err){
      console.log(err);
    });
  };

  paymentsCtrl.processPayment = function(payment) {
    if(!payment.member) {return;}
    if(!!payment.renew) {
      return memberService.renewMember(payment).then(function(){
        return paymentsService.processPayment(payment);
      }).catch(function(err){
        console.log(err);
      });
    } else if (!!payment.intro) {
      return memberService.introMember(payment).then(function(){
        return paymentsService.processPayment(payment);
      }).catch(function(err){
        console.log(err);
      });
    }
  };

  paymentsCtrl.toggleAllSelected = function() {
    if(paymentsCtrl.allSelected) {
      paymentsCtrl.payments.forEach(function(payment){
        payment.selected = false;
      });
      paymentsCtrl.allSelected = false;
    } else {
      paymentsCtrl.payments.forEach(function(payment){
        payment.selected = true;
      });
      paymentsCtrl.allSelected = true;
    }
  };
}
