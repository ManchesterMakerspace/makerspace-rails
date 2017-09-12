app.factory('calendarService', function($http){

  var getOrientationTimes = function(){
    return $http.get('/api/calendar').then(function(response){
      return response.data.items;
    });
  };

  var assignOrientation = function(event){
    return $http.put('/api/calendar/' + event.id, event);
  };

  return {
    getOrientationTimes: getOrientationTimes,
    assignOrientation: assignOrientation
  };
});
