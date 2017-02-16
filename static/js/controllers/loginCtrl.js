angular.module('myApp').controller("loginController", ['$scope', '$location', 'AuthService', '$mdDialog', "$rootScope",
    function($scope, $location, AuthService, $mdDialog, $rootScope) {

        $scope.loginForm = {
            email: "",
            password: ""
        };

        $scope.login = function() {
            $rootScope.inProgress = true;

            // initial values
            $scope.error = false;
            $scope.disabled = true;

            // call login from service
            AuthService.login($scope.loginForm.email, $scope.loginForm.password)
                // handle success
                .then(function() {
                    $rootScope.inProgress = false;

                    $scope.disabled = false;
                    $scope.loginForm = {};
                    $location.path("/");
                })
                // handle error
                .catch(function(mess) {
                    $rootScope.inProgress = false;

                    $scope.error = true;
                    $scope.errorMessage = mess;
                    $scope.disabled = false;
                    $scope.loginForm = {};
                });
        };

        //functions for registration dialog
        $scope.showAdvanced = function(ev) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: '../easyRASH/templates/authentication/register.html',
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
    }
]);
