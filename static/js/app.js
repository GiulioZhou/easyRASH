 var app = angular.module('myApp', ['ngMaterial'])
 	.config(function($mdThemingProvider) {
 		$mdThemingProvider.theme('default')
 			.primaryPalette('blue-grey')
 			.accentPalette('red');
});