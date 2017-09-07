app.factory('calendarService', function($http){

  var getOrientationTimes = function(){
    return $http.get('/api/calendar').then(function(response){
      return response.data;
    });
  };

  return {
    getOrientationTimes: getOrientationTimes
  };
});
