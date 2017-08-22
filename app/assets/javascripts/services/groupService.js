app.factory('groupService', function($http){

  var getAllGroups = function(){
    return $http.get('/api/groups').then(function(response){
      console.log(response);
      return response.data;
    });
  };

  return {
    getAllGroups: getAllGroups
  };
});
