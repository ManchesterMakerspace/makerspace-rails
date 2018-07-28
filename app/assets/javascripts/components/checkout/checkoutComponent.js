app.component('checkoutComponent', {
  templateUrl: 'components/checkout/_checkout.html',
  controller: checkoutController,
  controllerAs: "checkoutCtrl",
  bindings: {
  }
});

function checkoutController(checkoutService, alertService) {
  var checkoutCtrl = this;
  checkoutCtrl.$onInit = function() {
    checkoutCtrl.checkoutError = "";
    checkoutCtrl.initializeCheckoutFlow();
    checkoutService.getSubscriptions();
    checkoutService.getPlans();
  };

  checkoutCtrl.initializeCheckoutFlow = function () {
    checkoutService.getClientToken().then(function (token) {
      braintree.dropin.create({
        authorization: token,
        container: '#dropin-container',
        paypal: {
          flow: 'vault'
        }
      }).then(function (instance) {
        console.log(instance);
        checkoutCtrl.braintreeInstance = instance;
      }).catch(function (e) {
        checkoutCtrl.checkoutError = e;
      });
    });
  };

  checkoutCtrl.requestPaymentMethod = function () {
    checkoutCtrl.braintreeInstance.requestPaymentMethod(function (err, payload) {
      console.log(payload);
      if (err) {
        checkoutCtrl.checkoutError = err;
      }
      checkoutCtrl.noncePayload = payload;
      // Submit payload.nonce to your server
    });
  };

  checkoutCtrl.submitPayment = function () {
    var checkoutPayload = {
      payment_method_nonce: checkoutCtrl.noncePayload.nonce,
    };
    checkoutService.postCheckout(checkoutPayload).then(function (response) {
      if (response.status === 200) {
        alertService.addAlert("Success!", "success");
      } else {
        alertService.addAlert("Payment Failed!", "danger");
      }
    });
  };
}
