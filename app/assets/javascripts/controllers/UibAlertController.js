app.controller('UibAlertController', ['$scope', '$element', '$attrs', '$interpolate', '$interval', function($scope, $element, $attrs, $interpolate, $interval) {
   $scope.closeable = !!$attrs.close;
   $element.addClass('alert');
   $attrs.$set('role', 'alert');
   if ($scope.closeable) {
     $element.addClass('alert-dismissible');
   }
  var dismissOnTimeout = angular.isDefined($attrs.dismissOnTimeout) ? $interpolate($attrs.dismissOnTimeout)($scope.$parent) : null;

  if (dismissOnTimeout) {
    var alertInterval = $interval(function() {
      $scope.close();
      $interval.cancel(alertInterval);
    }, parseInt(dismissOnTimeout, 10));
  }
}]);
