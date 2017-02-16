angular.module('myApp')
	.controller("editDataController",
		function(AuthService, $scope, $http, $mdDialog, $rootScope) {

			//-------- SEND EDITED DATA ---------
			$scope.changeform = {};

			$scope.EditData = function() { 
				$http.post('api/editdata', $scope.changeform).then(function(res) {
					if (res.data.success) {
						dialogService.showAlertDialog(null, "", res.data.message , "success", "Got it!");
						location.reload();
					} else {
						 dialogService.showAlertDialog(null, "", res.data.message , "failed", "Got it!");
					}
				})
			}

			//-------- MODIFICA DATI ------------
			$scope.showAdvanced = function(ev) {
				$mdDialog.show({
					controller: DialogController,
					templateUrl: '../easyRASH/templates/authentication/datachange.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: true,
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

			//-------- GESTIONE LOGOUT ----------
			$scope.logout = function() {
				AuthService.logout();
			};

			//-------- USER MENU ----------------
			var originatorEv;

			$scope.openMenu = function($mdOpenMenu, ev) {
				originatorEv = ev;
				$mdOpenMenu(ev);
			};
		});
