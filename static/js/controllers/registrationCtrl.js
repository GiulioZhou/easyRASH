angular.module('myApp').controller("regiController", ['$scope', '$location', 'AuthService', '$mdDialog', "$window",
    function($scope, $location, AuthService, $mdDialog, $window) {

        $scope.regiForm = {
            given_name: "",
            family_name: "",
            email: "",
            pass: "",
            sex: ""
        };

        $scope.register = function() {
            // initial values
            $scope.error = false;
            $scope.disabled = true;
            // call register from service
            AuthService.register($scope.regiForm.given_name, $scope.regiForm.family_name, $scope.regiForm.email,
                    $scope.regiForm.password, $scope.regiForm.sex)
                // handle success
                .then(function() {
                    $scope.disabled = false;
                    $scope.registerForm = {};
                    $scope.error = true;
                    $scope.errorMessage = "Registration completed! Check your emails and verify your account!";
                })
                // handle error
                .catch(function(mess) {
                    $scope.error = true;
                    $scope.errorMessage = mess;
                    $scope.disabled = false;
                    $scope.registerForm = {};
                });
        };

    }
]);
