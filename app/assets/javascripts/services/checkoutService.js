app.factory('checkoutService', function($http){

  var getClientToken = function () {
    return $http.get("/api/payment/checkout/new").then(function (response) {
      return response.data.client_token;
    });
  };

  var postCheckout = function (checkoutPayload) {
    return $http.post("/api/payment/checkout", { checkout: checkoutPayload });
  };

  var getSubscriptions = function () {
    return $http.get("/api/payment/subscriptions")
  };

  var getPlans = function () {
    return $http.get("/api/payment/plans")
  };

  return {
    getClientToken: getClientToken,
    postCheckout: postCheckout,
    getPlans: getPlans,
    getSubscriptions: getSubscriptions
  };
});
