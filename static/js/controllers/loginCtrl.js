angular.module('myApp').controller("loginController", 
	['$scope','$location', 'AuthService', '$mdDialog', "$window",
 	function ($scope, $location, AuthService, $mdDialog, $window) {

 		$scope.loginForm={
 			email: "",
 			password:""
 		};


 		$scope.regiForm={
 			given_name: "",
 			family_name: "",
 			email: "",
 			pass: "",
 			sex: ""
 		};

 		$scope.login = function () {

			// initial values
			$scope.error = false;
			$scope.disabled = true;
			
			// call login from service
			AuthService.login($scope.loginForm.email, $scope.loginForm.password)
				// handle success
				.then(function () {
					$scope.disabled = false;
					$scope.loginForm = {};
					$window.location.href ="/"
				})
				// handle error
				.catch(function () {
					$scope.error = true;
					$scope.errorMessage = "Invalid username and/or password";
					$scope.disabled = false;
					$scope.loginForm = {};
				});
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


		//functions for registration dialog
		$scope.showAdvanced = function(ev) {
			$mdDialog.show({
				controller: DialogController,
				templateUrl: '../easyRASH/templates/register.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		});
		};

		function DialogController($scope, $mdDialog) {
			$scope.hide = function() {
				$mdDialog.hide();
			};

			$scope.cancel = function() {
				$mdDialog.cancel();
			};

			$scope.answer = function(answer) {
				$mdDialog.hide(answer);
			};
		}


	}]);
