app.factory('memberService', function($http){
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

  var getById = function(id){
    return $http.get('/api/members/' + id);
  };

  var createMember = function(formData){
    return $http.post('/api/admin/members', formData);
  };

  var renewMember = function(formData){
    return $http.put('/api/admin/members/' + formData.memberId, formData);
  };

  return {
    getAllMembers: getAllMembers,
    setMember: setMember,
    getById: getById,
    createMember: createMember,
    renewMember: renewMember
  };
});
