app.factory('paymentsService', function($http){

  var getAllPayments = function(){
    return $http.get('/api/admin/payments').then(function(response){
      return response.data;
    });
  };

  return {
    getAllPayments: getAllPayments
  };
});
