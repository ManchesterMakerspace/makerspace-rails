app.factory('workshopService', function($http){

  var getById = function(id){
    return $http.get('/api/workshops/' + id).then(function(response){
      return response.data;
    });
  };

  var getAllWorkshops = function(){
    return $http.get('/api/workshops').then(function(response){
      return response.data;
    });
  };

  var createWorkshop = function(formData){
    return $http.post('/api/workshops', formData).then(function(response){
      return response.data;
    });
  };

  var updateWorkshop = function(formData){
    return $http.put('/api/workshops/' + formData.workshopId, formData).then(function(response){
      return response.data;
    });
  };

  var deleteWorkshop = function(id){
    return $http.delete('/api/workshops/' + id);
  };

  return {
    getById: getById,
    getAllWorkshops: getAllWorkshops,
    createWorkshop: createWorkshop,
    updateWorkshop: updateWorkshop,
    deleteWorkshop: deleteWorkshop
  };
});
