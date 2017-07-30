app.factory('paymentsService', function($http){

  var getAllPayments = function(){
    return $http.get('/api/admin/payments');
  };

  return {
    getAllPayments: getAllPayments
  };
});
