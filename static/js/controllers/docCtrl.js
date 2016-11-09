angular.module('myApp').controller("homeController",["$scope","$sce","$http","$mdSidenav",function($scope,$sce,$http,$mdSidenav){
	// --------- usr identification -------------

	//$scope.usr = Object.assign({}, currentUser);
	$http.get("wsgi/api/getUser").success(function(data,status,headers,config){
		$scope.usr = data;


	});

	// --------- side-menu management -----------



	$scope.curDoc="../easyRASH/templates/homepage.html";



	$scope.getDoc = function () {
	   return $scope.curDoc;

  };

	$scope.loadPage = function () {
	   return $scope.curDoc="../easyRASH/templates/newEvent.html";

  };

	$scope.openLeftMenu = function() {
		$mdSidenav('left').toggle();

			// ----- document list ----------

    $http({
      url: "wsgi/api/getDocs",
      method: "GET",

      headers: {
        "Content-Type": "application/json"
      },
      params: {
        "name" : $scope.usr.name,
        "surname" : $scope.usr.surname,
        "email" : $scope.usr.email
      }

 		})
		.success(function(data,status,headers,config){

				$scope.documents=data.ret;
				console.log(data.ret);
			})
		.error(function(data,status,headers,config){
  				alert(status);
			});

	};

		$scope.loadPaper = function(url) {
			var baseUrl = "../easyRASH/project-files/dataset/";
	  		$scope.copleteUrl= baseUrl + url;
			$scope.curDoc = $scope.copleteUrl;
		};



}]);
