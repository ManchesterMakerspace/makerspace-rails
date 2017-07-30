var app = angular.module('app', [
  'ui.router',
  'templates',
  'Devise'
]).run(function ($transitions, $state, Auth, membersService) {
    $transitions.onBefore({}, function () {
        return Auth.currentUser().then(function(data){
            membersService.setMember(data);
        }).catch(function(){
        });
    });

    $transitions.onStart({}, function(trans){
        var toState = trans.to();

        if (!Auth.isAuthenticated()) {
          if(/root/.test(toState.name)) {
            $state.go('login');
          }
        } else {
          console.log('logged in');
          if(/login/.test(toState.name) || (/register/.test(toState.name))){
            $state.go("root.members");
          }
        }
    });
}).config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, AuthProvider){
  $locationProvider.hashPrefix('');
  $urlRouterProvider.otherwise('/members');
  $httpProvider.defaults.headers.common['X-CSRF-Token'] = angular.element('meta[name=csrf-token]').attr('content');

  AuthProvider.loginPath('api/members/sign_in.json');
  AuthProvider.loginMethod('POST');
  AuthProvider.resourceName('member');
  AuthProvider.logoutPath('api/members/sign_out.json');
  AuthProvider.logoutMethod('DELETE');

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
    });
});