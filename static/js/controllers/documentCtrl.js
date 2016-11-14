angular.module('myApp')
// .service("userSrv",["$http", "$q",  function($http, $q){
//  	// --------- usr identification -------------
// 	 	this.getUte = function(){
//
// 			var deferred = $q.defer();
// 			// send a post request to the server
// 			$http.get("wsgi/api/getUser")
// 				// handle success
// 				.success(function(data,status,headers,config) {
// 					if(status === 200 && data.result){
// 						deferred.resolve();
// 						console.log("the result is" + data.result);
// 					} else {
// 						deferred.reject();
// 					}
// 				})
// 				// handle error
// 				.error(function (data) {
// 					deferred.reject();
// 				});
//
// 			// return promise object
// 			return deferred.promise;
//  		};
// }])
.service('userSrv', function($http) {

    this.getUte = function() {

        return $http({
            method: 'GET',
            url: "wsgi/api/getUser",
            // pass in data as strings
          //  headers: {'Content-Type': 'application/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
        })
        .then(function(data) {
            return data;
        })
    }
})

.controller("documentController",["userSrv", "$scope","$sce","$http","$mdSidenav", '$mdDialog',function(userSrv, $scope,$sce,$http,$mdSidenav, $mdDialog){

	//Visualizzo pagina di presentazione
	$scope.curDoc="../easyRASH/templates/homepage.html";

	//Carico utenti e documenti
	// $http.get("wsgi/api/getUser").success(function(data,status,headers,config){
	// 	$scope.usr = data;
	// 	$scope.updateDocs();
	// });
	var ute = userSrv.getUte();
	var login = {};

	


	login=ute.then(function (data) {
       console.log("data is", data.data);
       return data.value;
   });

	
	console.log("data2 is", login);

	//Ho messo questa funzione perchè cosi la si può richimare premendo il pulsante aggiorna documenti sul sidenav
	//L'http è stata tolta dal sidenav per alleggerirlo, infatti ora non laggerà più quando la si apre (troppi refresh inutili)
	//Aggiorna i documenti
	$scope.updateDocs=function(){
		$http.get("wsgi/api/getDocs").success(function(data,status,headers,config){
			$scope.documents=data.ret;
		});
	};

	//Carica e chiude il sidenav
	$scope.leftMenu = function(par, url) {
		if(par=="close"){
			$mdSidenav('left').close();
			$scope.curDoc = "../easyRASH/project-files/dataset/"+url;
		}
		else{
			$mdSidenav('left').toggle();
		}
	};



//ATTENZIONE LE FUNZIONI QUI SOTTO DOVRANNO ESSERE SPOSTATE IN ANNOTCTRL.JS (DA CAMBIARE NOME!!!! GRRRR)

function generateID(){
}

function insertSpan(selection){
  var span = document.createElement("span");
  span.className = "Mark"
  span.appendChild(selection.extractContents());
  selection.insertNode(span);
}

      //functions for dialog
		$scope.annotate = function(ev) {
			console.log("ciao");
      var selection = window.getSelection().getRangeAt(0);

      var confirm = $mdDialog.prompt()
      .title('New annotation')
      .placeholder('your text here')
      .ariaLabel('your annotation')
      .targetEvent(ev)
      .ok('Insert')
      .cancel('Delete');

    $mdDialog.show(confirm).then(function(result) {
      $scope.status = 'Your annotation is ' + result + '.';
      insertSpan(selection);

    }, function() {
      $scope.status = 'You\'re an asshole';
    });

		};

//FINE PARTE
}]);
