app.factory('rentalsService', function($http){

  var getAllRentals = function(){
    return $http.get('/api/rentals').then(function(response){
      return response.data;
    });
  };

  var getByID = function(id){
    return $http.get('/api/rentals/' + id).then(function(response){
      return response.data;
    });
  };

  return {
    getAllRentals: getAllRentals,
    getByID: getByID
  };
});
