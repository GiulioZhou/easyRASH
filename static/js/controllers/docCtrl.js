angular.module('myApp').controller("homeController",["$scope","$sce","$http","$mdSidenav",function($scope,$sce,$http,$mdSidenav){
	// --------- usr identification -------------

	//$scope.usr = Object.assign({}, currentUser);

	$http.get("wsgi/api/getUser").success(function(data,status,headers,config){
		$scope.usr = data;
		
	});



	// --------- side-menu management -----------

	// Rash documents of the user
	$scope.usr_docs = [];

	$scope.curDoc="";

	$scope.openLeftMenu = function() {
		$mdSidenav('left').toggle();

			// ----- document list ----------
			
			/*
			$http({
				url: 'wsgi/ciao',
				method: 'GET',
			//	params:{name:$scope.usr.name, surname:$scope.usr.surname, email: $scope.usr.email}
			}).success(function(data, status, headers, config){
				alert(data.result);

			}).error(function(data, status, headers, config){
				alert(status);
			});*/
			
			$http.get("wsgi/api/usr_docs", {params:{"name": $scope.usr.name, "surname": $scope.usr.surname, "email": $scope.usr.email}})
			.success(function(data,status,headers,config){
				alert("ciao");	
			})
			.error(function(data,status,headers,config){
				alert(status);	
			});


	};

	/*non funziona
	var htmlcontent = $('#loadhtml ');
    htmlcontent.load('../easyRASH/project-files/dataset/bardi-savesd2015.html')
    $compile(htmlcontent.contents())($scope);
	*/


	/*
	$http({method: 'GET', url: 'http://site1610.web.cs.unibo.it/easyRASH/project-files/events.json'}).
		success(function(data, status, headers, config) {
		  var total = data.length;
		  for (var i=0; i<total; i++) { // scan events
			//search if usr is a chair
			for(var j=0; j<data[i].chairs.length; j++){ // scan event's chairs
				var mail = data[i].chairs[j].split('<')[1];
				if(mail == $scope.usr.email+">"){
				//usr is chair for the i-th conference

					//we want to see all the documents
					for(var k=0; k<data[i].submissions.length; k++){
						var elem={
							title: data[i].submissions[k].title, // paper's title
							acronym : data[i].acronym,
							conference: data[i].conference, // name of the conference
							url: data[i].submissions[k].url, // url of the paper
							role : "chair"
							// we could also add a field = 1 if the user can review... maybe later
						}
						$scope.usr_docs.push(elem);
					}
				}
			}
		  }
		}).
		error(function(data, status, headers, config) {
		  // log error
		  alert("Errore nel caricamento degli eventi");
		});*/



		$scope.loadPaper = function(url) {
			$scope.curDoc = url;
		};

/*
		$scope.noScrollbar = function(obj){//used for remove the scrollbar of iframe
			obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
			alert("ciao");
		}();*/
	/*
	//singleton for search usr's documents
	function($scope.usr.email) {
	angular.forEach($scope.myData.SerialNumbers, function(value, key) {//credo che key scorra tra i serial numbers e value sia il valore dell'oggetto associato
        if (key === enteredValue) {
            $scope.results.push({serial: key, owner: value[0].Owner});
        }
    });
	};
	*/
}]);


app.directive('compile', ['$compile', function ($compile) {
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function(value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            );
        };
    }]);
