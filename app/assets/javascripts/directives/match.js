app.directive('match', function() {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function(scope, element, attrs, ngModel) {
      if (!ngModel) { return; }

      element.on('focus', function(){
          ngModel.$validators.match = function(modelValue, viewValue) {
              return viewValue === scope.$eval(attrs.match).$viewValue;
          };
      });
    }
  };
});
