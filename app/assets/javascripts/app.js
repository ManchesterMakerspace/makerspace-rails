var app = angular.module('app', [
  'ui.router',
  'templates',
  'ng-token-auth',
  'ipCookie'
]).config(function($stateProvider, $urlRouterProvider, $locationProvider){
  $locationProvider.hashPrefix('');
  $urlRouterProvider.otherwise('/members')
  $stateProvider
    .state('login', {
      url: '/login',
      component: 'loginComponent'
    })
    .state('root', {
      url: '',
      abstract: true,
      component: 'rootComponent'
    })
    .state('root.members', {
      url: '/members',
      component: 'membersIndexComponent',
      resolve: {
        members: function(membersService){
          return membersService.getAllMembers();
        }
      }
    })
})
