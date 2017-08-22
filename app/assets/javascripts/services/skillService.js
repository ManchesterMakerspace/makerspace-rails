app.factory('skillService', function($http){

  var deleteSkill = function(formData){
    return $http.delete('/api/workshops/' + formData.workshopId + '/skills/' + formData.skillId);
  };

  var addSkill = function(formData){
    return $http.post('/api/workshops/' + formData.workshopId + '/skills/' + formData.skillId);
  };

  var editSkill = function(formData){
    return $http.put('/api/workshops/' + formData.workshopId + '/skills/' + formData.skillId);
  };

  return {
    deleteSkill: deleteSkill,
    addSkill: addSkill,
    editSkill: editSkill
  };
});
