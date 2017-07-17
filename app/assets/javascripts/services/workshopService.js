app.factory('workshopService', function($http){

  var getById = function(id){
    return $http.get('/api/workshops/' + id);
  };

  var getAllWorkshops = function(){
    return $http.get('/api/workshops');
  };

  var createWorkshop = function(formData){
    return $http.post('/api/workshops', formData);
  };

  var updateWorkshop = function(formData){
    return $http.put('/api/workshops/' + formData.workshopId, formData);
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
