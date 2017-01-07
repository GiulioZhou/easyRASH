 var app = angular.module('myApp');


app.directive('annotations', function() {
  return {
	restrict: 'E',
    templateUrl: '../easyRASH/templates/document/listAnnotations.html'
  };
});

app.directive('annotatorDial', function() {
  return {
	restrict: 'E',
    templateUrl: '../easyRASH/templates/document/annotatorDial.html'
  };
});

app.directive('sidenav', function() {
  return {
	restrict: 'E',
    templateUrl: '../easyRASH/templates/document/sidenav.html'
  };
});

app.directive('events', function() {
  return {
	restrict: 'E',
    templateUrl: '../easyRASH/templates/document/events.html'
  };
});

app.directive('toolbar', function() {
  return {
	restrict: 'E',
    templateUrl: '../easyRASH/templates/document/toolbar.html'
  };
});

app.directive('userMenu', function() {
  return {
	restrict: 'E',
    templateUrl: '../easyRASH/templates/document/userMenu.html'
  };
});

app.directive('document', function() {
  return {
	restrict: 'E',
    templateUrl: '../easyRASH/templates/document/document.html'
  };
});