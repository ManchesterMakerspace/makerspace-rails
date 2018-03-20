app.directive('blacklist', function() {
  return {
    restrict: 'A',
    scope: {
      blacklist: '=',
      safeword: '='
    },
    require: '?ngModel',
    link: function(scope, element, attrs, ngModel) {
      if (!ngModel) { return; }
      var blacklist = scope.blacklist.map(function(model){
        return model.number;
      }).filter(function (number) {
        return number !== scope.safeword;
      })

      ngModel.$parsers.unshift(function(value){
        if(!scope.safeword || value !== scope.safeword.number){
          var valid = blacklist.indexOf(value) === -1;
          ngModel.$setValidity('blacklist', valid);
          return valid ? value : undefined;
        } else {
          return true;
        }
      });

      ngModel.$formatters.unshift(function(value){
        if(!scope.safeword || value !== scope.safeword.number){
          var valid = blacklist.indexOf(value) === -1;
          ngModel.$setValidity('blacklist', valid);
        }
        return value;
      });
    }
  };
});
