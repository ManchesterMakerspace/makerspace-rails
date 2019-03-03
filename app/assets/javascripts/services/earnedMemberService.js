app.factory('earnedMemberService', function ($http) {

  var getAllMembers = function (search) {
    var url = '/api/earned_members' + (search ? ("?search=" + search) : "");
    return $http.get(url).then(function (response) {
      var members = response.data.map(function (member) {
        member.expirationTime = new Date(member.expirationTime);
        return member;
      });
      return members;
    });
  };

  var getById = function (id) {
    return $http.get('/api/earned_members/' + id).then(function (response) {
      return response.data;
    });
  };

  var createMember = function (memberData) {
    return $http.post('/api/admin/earned_members', { member: memberData }).then(function (response) {
      return response.data;
    });
  };

  var updateMember = function (memberData) {
    return $http.put('/api/admin/earned_members/' + memberData.id, { member: memberData }).then(function (response) {
      return response.data;
    });
  };

  return {
    getAllMembers: getAllMembers,
    getById: getById,
    createMember: createMember,
    updateMember: updateMember
  };
});
