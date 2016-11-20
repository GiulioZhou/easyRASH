/*
// ------- GESTIONE UTENTE ----------

//Carico utenti e documenti
 $http.get("wsgi/api/getUser").success(function(data,status,headers,config){
  $scope.usr = data;
  docSrv.updateDocs();
 });

 // --------- GESTIONE VISUALIZZAZIONE DOC ------------
 //Visualizzo pagina di presentazione
//$scope.curDoc="../easyRASH/templates/homepage.html";
$scope.curDoc=
//Aggiorna i documenti
$scope.updateDocs=function(){

    $scope.documents=docSrv.updateDocs();

};*/

angular.module('myApp')
.factory('docSrv',
	['$q', '$timeout', '$http',
	function ($q, $timeout, $http) {

		// create document list variable
		var _docs = [];

		//Visualizzo pagina di presentazione
	 var _curDoc="../easyRASH/templates/homepage.html";

		// return available functions for use in controllers
		return ({
			getCurDoc: getCurDoc,
			changeCurDoc: changeCurDoc,
			getDocList: getDocList,
			updateDocs: updateDocs
		});

		function getCurDoc() {
			return _curDoc;
		}

	 //Aggiorna i documenti
	 function updateDocs(){
		 $http.get("wsgi/api/getDocs").success(function(data,status,headers,config){
			 _docs=data.ret;
		 });
		 return _docs;
	 }

	 function getDocList(){
		 return _docs;
	 }

	 function changeCurDoc(url){
		 _curDoc=url;
	 }
 }]);
