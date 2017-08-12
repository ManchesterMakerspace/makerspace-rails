var app = angular.module('app', [
  'ui.router',
  'templates',
  'Devise',
  'ngAnimate',
  'ngMaterial',
  'ngMessages'
]).run(function (){
}).config(function($stateProvider, $urlRouterProvider, $locationProvider, AuthProvider){
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
          return Auth.currentUser().then(function(response){
            return response;
          }).catch(function(err){
            console.log(err);
            return {};
          });
        }
      }
    })
    .state('root.admin', {
      url: '/admin',
      abstract: true
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
    })
    .state('root.rentals', {
      url: '/rentals',
      component: 'rentalsComponent',
      resolve: {
        rentals: function(rentalsService) {
          return rentalsService.getAllRentals();
        },
        members: function(memberService){
          return memberService.getAllMembers();
        }
      }
    })
    .state('root.rentals.edit', {
      url: '/:id',
      component: 'rentalFormComponent',
      resolve: {
        rental: function(rentalsService, $stateParams) {
          return rentalsService.getByID($stateParams.id).then(function(response){
            return response;
          }).catch(function(err){
            return err; //return error so state doesn't drop
          });
        }
      }
    })
    .state('root.rentals.new', {
      url: '/new',
      component: 'rentalFormComponent'
    })
    .state('root.workshops', {
      url: '/workshops',
      component: 'workshopsComponent',
      resolve: {
        workshops: function(workshopService){
          return workshopService.getAllWorkshops();
        }
      }
    });
});
