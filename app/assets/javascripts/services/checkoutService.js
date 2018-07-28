app.factory('checkoutService', function($http){

  var getClientToken = function () {
    return $http.get("/api/checkout").then(function (response) {
      return response.data.client_token;
    });
  };

  var postCheckout = function (checkoutPayload) {
    return $http.post("/api/checkout", { checkout: checkoutPayload });
  };

  var getSubscriptions = function () {
    return $http.get("/api/checkout/subscriptions")
  };

  var getPlans = function () {
    return $http.get("/api/checkout/plans")
  };

  return {
    getClientToken: getClientToken,
    postCheckout: postCheckout,
    getPlans: getPlans,
    getSubscriptions: getSubscriptions
  };
});
