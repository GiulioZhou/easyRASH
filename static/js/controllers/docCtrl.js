angular.module('myApp').controller("homeController",["$scope","$sce","$http","$mdSidenav", '$mdDialog',function($scope,$sce,$http,$mdSidenav, $mdDialog){
	// --------- usr identification -------------

	//$scope.usr = Object.assign({}, currentUser);
	$http.get("wsgi/api/getUser").success(function(data,status,headers,config){
		$scope.usr = data;


	});
	/*$scope.usr = usrSrv.getUsr();*/
	// --------- side-menu management -----------

	$scope.curDoc="../easyRASH/templates/homepage.html";

	$scope.getDoc = function () {
	   return $scope.curDoc;

  };

	$scope.loadPage = function () {
	   return $scope.curDoc="../easyRASH/templates/newEvent.html";

  };

	$scope.leftMenu = function(par, url) {
		if(par=="close"){
			$mdSidenav('left').close();
			$scope.loadPaper(url);
		}
		else{
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
		}
	};

	
		$scope.loadPaper = function(url) {
			var baseUrl = "../easyRASH/project-files/dataset/";
	  		$scope.copleteUrl= baseUrl + url;
			$scope.curDoc = $scope.copleteUrl;
		};



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
      $scope.status = 'You\'re an asshole :\(';
    });


		};



}]);

angular.module('myApp').directive('resizeFrame',function() {
	function linkFoo(scope, element, attrs) {

 	var metaEl = angular.element(document).find("ng-inclde").children().find("meta");
     var linkEl = angular.element(document).find("ng-inclde").children().find("link");
     var scriptEl = angular.element(document).find("ng-inclde").children().find("script");
     var titleEl = angular.element(document).find("ng-inclde").children().find("title");
   console.log(metaEl);
    titleEl.remove();
     metaEl.remove();
     linkEl.remove();
     scriptEl.remove();
   
    

	}return {
     link:linkFoo,
     
   };
 });


