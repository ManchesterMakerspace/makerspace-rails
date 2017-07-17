app.factory('cardService', function($http){

  var getLatestRejection = function(){
    return $http.get('/api/admin/cards/new');
  };

  return {
    getLatestRejection: getLatestRejection
  };
});
