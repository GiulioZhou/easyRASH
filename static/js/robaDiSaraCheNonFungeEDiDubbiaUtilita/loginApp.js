'use strict';

angular.module('authApp', [])

.config([ '$routeProvider', '$interpolateProvider',
  function config( $routeProvider, $interpolateProvider) {
alert('ciao');
 $interpolateProvider.startSymbol('{[{').endSymbol('}]}');

 $routeProvider
 .when('/login', {
   templateUrl: '../easyRASH/templates/authentication/loginPage.html',
   controller: 'loginController',
   restricted: false
 });

}]);
