app.factory('rentalsService', function($http){

  var getAllRentals = function(){
    return $http.get('/api/rentals').then(function(response){
      console.log(response);
      return response.data;
    })
  }

  return {
    getAllRentals: getAllRentals
  };
});
