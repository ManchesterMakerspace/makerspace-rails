app.factory('tokenService', function($http){

  var validate = function(id, token){
    return $http.post('/api/token/' + id + "/" + token).then(function(response){
      return response.data;
    });
  };

  return {
    validate: validate
  };
});
