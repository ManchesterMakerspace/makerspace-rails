var app = angular.module('app', [
  'ui.router',
  'templates',
  'Devise'
]).run(function ($transitions, $state, Auth, memberService) {
    $transitions.onBefore({}, function () {
        return Auth.currentUser().then(function(data){
            return memberService.setMember(data);
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

  AuthProvider.loginPath('api/members/sign_in.json');
  AuthProvider.resourceName('member');
  AuthProvider.logoutPath('api/members/sign_out.json');

  $urlRouterProvider.otherwise('/members');
  $stateProvider
    .state('login', {
      url: '/login',
      component: 'loginComponent'
    })
    .state('root', {
      url: '',
      abstract: true,
      component: 'rootComponent',
      resolve: {
        currentUser: function(Auth){
          return Auth.currentUser();
        }
      }
    })
    .state('root.members', {
      url: '/members',
      component: 'membersIndexComponent',
      resolve: {
        members: function(memberService){
          return memberService.getAllMembers();
        }
      }
    })
    .state('root.memberships', {
      url: '/memberships',
      component: 'membershipsComponent',
      resolve: {
        members: function(memberService){
          return memberService.getAllMembers();
        }
      }
    })
    .state('root.memberships.new', {
      url: '/new',
      component: 'newMemberComponent',
      resolve: {
        card: function(cardService){
          return cardService.getLatestRejection();
        }
      }
    })
    .state('root.memberships.renew', {
      url: '/renew',
      component: 'renewMemberComponent',
      resolve: {
        members: function(memberService){
          return memberService.getAllMembers();
        }
      }
    })
    .state('root.payments', {
      url: '/payments',
      component: 'paymentsComponent',
      resolve: {
        members: function(memberService){
          return memberService.getAllMembers();
        },
        payments: function(paymentsService){
          return paymentsService.getAllPayments();
        }
      }
    });
});
