 var app = angular.module('myApp', ['ngMaterial'])
 
 	.config(function($mdThemingProvider) {
 		$mdThemingProvider.theme('default')
 			.primaryPalette('blue-grey')
 			.accentPalette('red');
	});
	

app.controller('MyController', function($scope, $mdSidenav) {
  $scope.openLeftMenu = function() {
    $mdSidenav('left').toggle();
  };
  });
