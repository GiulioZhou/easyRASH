 var app = angular.module('myApp', ['ngMaterial', 'ngRoute', "duScroll"])

 .config(function($mdThemingProvider, $routeProvider, $interpolateProvider) {

     $mdThemingProvider.theme('default')
         .primaryPalette('blue-grey')
         .accentPalette('red');

     $interpolateProvider.startSymbol('{[{').endSymbol('}]}');

     $routeProvider
         .when('/', {
             templateUrl: '../easyRASH/templates/base.html',
             restricted: true
         })
         .when('/login', {
             templateUrl: '../easyRASH/templates/authentication/loginPage.html',
             controller: 'loginController',
             restricted: false
         })
         .otherwise({
             redirectTo: '/'
         });

 })


 .run(function($rootScope, $location, $route, AuthService) {

     $rootScope.$on('$routeChangeStart',
         function(event, next, current) {
             $rootScope.inProgress = true;
             AuthService.getUserStatus()
                 .then(function() {
                     if (next.restricted && !AuthService.isLoggedIn()) {
                         $location.path('/login');
                     }
                 });
         });
         
         $rootScope.$on('$routeChangeSuccess', function(){
            $rootScope.inProgress=false;
         })

 });
