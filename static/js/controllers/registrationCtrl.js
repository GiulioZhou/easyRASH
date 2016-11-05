
angular.module('myApp').controller("regiController", ['$scope','$location', 'AuthService', '$mdDialog', "$window",
 	function ($scope, $location, AuthService, $mdDialog, $window) {

 		$scope.regiForm={
 			given_name: "",
 			family_name: "",
 			email: "",
 			pass: "",
 			sex: ""
 		};

			$scope.register = function () {
				console.log("in registration function");

			// initial values
			$scope.error = false;
			$scope.disabled = true;
			// call register from service
			AuthService.register($scope.regiForm.given_name, $scope.regiForm.family_name,$scope.regiForm.email,
				$scope.regiForm.password, $scope.regiForm.sex)
				// handle success
				.then(function () {
					console.log("oki!");
					$location.path('/');
					$scope.disabled = false;
					$scope.registerForm = {};
				})
				// handle error
				.catch(function () {
					$scope.error = true;
					$scope.errorMessage = "Something went wrong!";
					$scope.disabled = false;
					$scope.registerForm = {};
				});
			};

	}]);
