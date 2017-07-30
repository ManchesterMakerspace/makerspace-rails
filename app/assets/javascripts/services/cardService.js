app.factory('cardService', function($http){

  var getLatestRejection = function(){
    return $http.get('/api/admin/cards/new').then(function(response){
      return response.data;
    });
  };

  return {
    getLatestRejection: getLatestRejection
  };
});
