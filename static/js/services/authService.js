var app = angular.module('myApp').service('AuthService', ['$q', '$timeout', '$http', "$rootScope", "$location",
    function($q, $timeout, $http, $rootScope, $location) {

        var user = false;

        return ({
            updateUser: updateUser,
            isLoggedIn: isLoggedIn,
            login: login,
            logout: logout,
            register: register,
            getUserStatus: getUserStatus

        });

        function updateUser() {           
            var deferred = $q.defer();

            $http.get("api/getUser").success(function(data, status, headers, config) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject("error");
                });
            return deferred.promise;
        }

        function isLoggedIn() {
            if (user) {
                return true;
            } else {
                return false;
            }
        }

        function login(email, password) {
            var deferred = $q.defer();
            $http.post('api/login', { email: email, pass: password })
                .success(function(data, status) {
                    if (status === 200 && data.result === true) {
                        user = true;
                        deferred.resolve();
                    } else {
                        user = false;
                        deferred.reject(data.result);
                    }
                })
                .error(function(data) {
                    user = false;
                    deferred.reject("You've met a terrible fate, haven't you?");
                });
            return deferred.promise;
        }


        function logout() {
            var deferred = $q.defer();
            $http.get('api/logout')
                .success(function(data) {
                    user = false;
                    userData = {};
                    deferred.resolve();
                    $location.path('/login');
                })
                .error(function(data) {
                    user = false;
                    deferred.reject();
                });
            return deferred.promise;
        }
        
        function register(given_name, family_name, email, pass, sex) {
            var deferred = $q.defer();
            $http.post('api/register', {
                    given_name: given_name,
                    family_name: family_name,
                    email: email,
                    pass: pass,
                    sex: sex
                })
                .success(function(data, status) {
                    if (status === 200 && data.result === true) {
                        deferred.resolve();
                    } else {
                        deferred.reject("This user is already registered!");
                    }
                })
                .error(function(data) {
                    deferred.reject("You've met a terrible fate, haven't you?");
                });
            return deferred.promise;
        }

        function getUserStatus() {
            return $http.get('api/status')
                .success(function(data) {
                    if (data.status) {
                        user = true;
                    } else {
                        user = false;
                    }
                })
                .error(function(data) {
                    user = false;
                });
        }
    }
]);
