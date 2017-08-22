app.factory('paymentsService', function($http, $filter){

  var getAllPayments = function(){
    return $http.get('/api/admin/payments').then(function(response){
      return response.data;
    });
  };

  var processPayment = function(paymentData) {
    console.log(paymentData);
    return $http.put('/api/admin/payments/' + paymentData.txn_id, {payment: paymentData});
  };

  return {
    getAllPayments: getAllPayments,
    processPayment: processPayment
  };
});
