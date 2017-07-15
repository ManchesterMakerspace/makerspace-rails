var app = angular.module('app', [
  'ui.router',
  'templates'
]).config(function($stateProvider, $urlRouterProvider, $locationProvider){
  $locationProvider.hashPrefix('');
  $urlRouterProvider.otherwise('/')
  $stateProvider
    .state('root', {
      url: '/',
      component: 'rootComponent'
    })
})
