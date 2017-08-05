app.factory('membersService', function($http){
  var member = {};

  var getAllMembers = function(){
    return $http.get('/api/members').then(function(response){
      var members = response.data.map(function(member){
        member.allowedWorkshops = member.allowed_workshops.map(function(shop){
          return shop.name;
        }).join(", ");
        delete member.allowed_workshops;
        member.expirationTime = new Date(member.expirationTime);
        return member;
      });
      return members;
    });
  };

  var setMember = function(mbr){
    angular.copy(mbr, member);
  };

  return {
    getAllMembers: getAllMembers,
    setMember: setMember
  };
});
