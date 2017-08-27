app.factory('tokenService', function($http){

  var validate = function(id, token){
    return $http.post('/api/token/' + id + "/" + token).then(function(response){
      return response.data;
    });
  };

  var inviteMember = function(email){
    return $http.post('/api/token', {email: email});
  };

  var getContract = function(){
    return $http.get('/api/members/contract');
  };

  return {
    validate: validate,
    inviteMember: inviteMember,
    getContract: getContract
  };
});
