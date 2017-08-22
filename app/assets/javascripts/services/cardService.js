app.factory('cardService', function($http){

  var getLatestRejection = function(){
    return $http.get('/api/admin/cards/new').then(function(response){
      return response.data;
    });
  };

  var createCard = function(cardData){
    return $http.post('/api/admin/cards', {card: cardData}).then(function(response){
      return response.data;
    });
  };

  var updateCard = function(cardData) {
    return $http.put('/api/admin/cards/' + cardData.id, {card: cardData}).then(function(response){
      return response.data;
    });
  };

  var getMemberCards = function(memberID) {
    return $http.get('/api/admin/cards/' + memberID).then(function(response){
      return response.data;
    });
  };

  return {
    getLatestRejection: getLatestRejection,
    createCard: createCard,
    updateCard: updateCard,
    getMemberCards: getMemberCards
  };
});
