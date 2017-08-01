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

  var upsertRental = function(rentalData) {
    if(!rentalData.id) {
      return $http.post('/api/admin/rentals', {rental: rentalData}).then(function(response){
        return response.data;
      });
    } else if (!!rentalData.id){
      return $http.put('/api/admin/rentals/' + rentalData.id, {rental: rentalData}).then(function(response){
        return response.data;
      });
    }
  };

  return {
    getAllRentals: getAllRentals,
    getByID: getByID,
    upsertRental: upsertRental
  };
});
