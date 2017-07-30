var app = angular.module('app', [
  'ui.router',
  'templates',
  'Devise',
  'ngAnimate',
  'ngMaterial',
  'ngMessages'
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
          if(toState.name === "members"){
            return;
          } else if(/root/.test(toState.name)) {
            $state.go('login');
          }
        } else {
          if(/login/.test(toState.name) || (/register/.test(toState.name))){
            $state.go("root.members");
          } else if (/root.admin/.test(toState.name)) {
            return Auth.currentUser().then(function(user){
              if(user.role === 'admin') {
                return;
              } else {
                $state.go("root.members");
                console.log('error');
                //send error notification
              }
            })
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
    .state('root.admin', {
      url: '/admin',
      abstract: true
    })
    .state('members', {
      url: '/members',
      component: 'membersIndexComponent',
      resolve: {
        members: function(memberService){
          return memberService.getAllMembers();
        }
      }
    })
    .state('root.admin.memberEdit', {
      url: '/members/:id',
      component: 'memberEditComponent',
      resolve: {
        member: function($stateParams, memberService) {
          return memberService.getById($stateParams.id);
        }
      }
    })
    .state('root.memberships', {
      url: '/memberships',
      component: 'membershipsComponent',
      abstract: true,
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
      component: 'renewMemberComponent'
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
