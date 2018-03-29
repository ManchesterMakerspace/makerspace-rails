app.factory('memberService', function($http, slackService){

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

  var getById = function(id){
    return $http.get('/api/members/' + id).then(function(response){
      return response.data;
    });
  };

  var createMember = function(memberData){
    return $http.post('/api/admin/members', {member: memberData}).then(function(response){
      slackService.connect();
      slackService.invite(response.data.email, response.data.fullname);
      slackService.disconnect();
      return response.data;
    });
  };

  var updateMember = function(memberData) {
    return $http.put('/api/admin/members/' + memberData.id, {member: memberData}).then(function(response){
      return response.data;
    });
  };


  var renewMember = function(memberData) {
    return $http.put('/api/admin/members/renew/' + memberData.id, {member: memberData}).then(function(response){
      return response.data;
    });
  };

  return {
    getAllMembers: getAllMembers,
    renewMember: renewMember,
    getById: getById,
    createMember: createMember,
    updateMember: updateMember
  };
});
