//define authentication service
var app = angular.module('myApp').factory('AuthService',
	['$q', '$timeout', '$http',
	function ($q, $timeout, $http) {

		// create user variable
		var user = null;

		// return available functions for use in controllers
		return ({
			isLoggedIn: isLoggedIn,
			login: login,
			logout: logout,
			register: register,
			getUserStatus: getUserStatus

		});


		function isLoggedIn() {
			if(user) {
				return true;
			} else {
				return false;
			}
		}

		function login(email, password) {

			// create a new instance of deferred
			var deferred = $q.defer();
			// send a post request to the server
			$http.post('wsgi/api/login', {email: email, pass: password})
				// handle success
				.success(function (data, status) {
					if(status === 200 && data.result){
						user = true;
						deferred.resolve();
						console.log(data.result);
					} else {
						user = false;
						deferred.reject();
					}
				})
				// handle error
				.error(function (data) {
					user = false;
					deferred.reject();
				});

			// return promise object
			return deferred.promise;
		}


		function logout() {

			// create a new instance of deferred
			var deferred = $q.defer();

			// send a get request to the server
			$http.get('wsgi/api/logout')
				// handle success
				.success(function (data) {
					user = false;
					deferred.resolve();
					location.reload();
				})
				// handle error
				.error(function (data) {
					user = false;
					deferred.reject();
				});

			// return promise object
			return deferred.promise;

		}


		function register(given_name, family_name, email, pass, sex) {
			// create a new instance of deferred
			var deferred = $q.defer();
			// send a post request to the server
			$http.post('wsgi/api/register', { given_name: given_name,
				family_name: family_name,
				email: email,
				pass: pass,
				sex: sex
			})
				// handle success
				.success(function (data, status) {
					if(status === 200 && data.result){
						console.log(data.result);
						console.log("utente registrato");
						deferred.resolve();
					} else {
						console.log(data.result);
						console.log("utente non registrato");
						deferred.reject();
					}
				})
				// handle error
				.error(function (data) {
					console.log("errore");
					deferred.reject();
				});
			// return promise object
			return deferred.promise;
		}



		function getUserStatus() {
			return $http.get('wsgi/api/status')
		      // handle success
		      .success(function (data) {
		      	if(data.status){
		      		user = true;
		      	} else {
		      		user = false;
		      	}
		      })
		      // handle error
		      .error(function (data) {
		      	user = false;
		      });
		  }


}]);
