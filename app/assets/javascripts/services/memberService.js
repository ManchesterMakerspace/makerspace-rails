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

  var renewMemberByPayment = function(paymentData){
    var member = paymentData.member;
    member.renewal = {
      months: paymentData.months
    };
    return $http.put('/api/admin/members/' + paymentData.member.id, {member: member});
  };

  var updateMember = function(memberData) {
    return $http.put('/api/admin/members/' + memberData.id, {member: memberData}).then(function(response){
      return response.data;
    });
  };


  // var introMember = function(paymentData){
  //   var member;
  //   if (!paymentData.member){
  //     member = {
  //       fullname: "Will Lynch",
  //       email: "will.lynch91@gmail.com"
  //       // fullname: paymentData.firstname + " " + paymentData.lastname,
  //       // email: paymentData.payer_email
  //     };
  //   } else {
  //     // member = paymentData.member;
  //   }
  //
  //   return $http.post('/api/admin/members/intro', {member: member}).then(function(response){
  //     console.log(response);
  //     return response.data;
  //   });
  // };

  return {
    getAllMembers: getAllMembers,
    getById: getById,
    createMember: createMember,
    renewMemberByPayment: renewMemberByPayment,
    updateMember: updateMember
  };
});
