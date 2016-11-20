angular.module('myApp')
.controller("documentController",["commentSrv", "$scope","$sce","$http","$mdSidenav", '$mdDialog', "$mdToast",
	function(commentSrv, $scope,$sce,$http,$mdSidenav, $mdDialog, $mdToast){

	// ------- GESTIONE UTENTE ----------

	//Carico utenti e documenti
	 $http.get("wsgi/api/getUser").success(function(data,status,headers,config){
		$scope.usr = data;
	 	$scope.updateDocs();
	 });

	 // --------- GESTIONE VISUALIZZAZIONE DOC ------------
	 //Visualizzo pagina di presentazione
 	$scope.curDoc="../easyRASH/templates/homepage.html";

	//Aggiorna i documenti
	$scope.updateDocs=function(){
		$http.get("wsgi/api/getDocs").success(function(data,status,headers,config){
			$scope.documents=data.ret;
		});
	};


	// ------------- GESTIONE SIDENAV -----------------
	//      VORREI METTERLO IN UN CTRL A PARTE

	//Carica e chiude il sidenav di sinistra
	$scope.leftMenu = function(par, url) {
		if(par=="close"){
			$mdSidenav('left').close();
			$scope.url=url;
			$scope.curDoc = "../easyRASH/static/papers/"+url;
		}
		else{
			$mdSidenav('left').toggle();
		}
	};

	//Carica e chiude il sidenav di destra
	$scope.rightMenu = function(par, url) {
		if(par=="close"){
			$mdSidenav('right').close();
		}
		else{
			$mdSidenav('right').toggle();
				$scope.rightUrl = "./yetToSave.html";
				$scope.classFstButton = "md-raised";
			/*
				caricaAnnotazioni(url);
			*/
		}
	};

	$scope.viewAnnot = function(code){
		switch (code) {
            case '1':
                $scope.rightUrl = "./savedAnnot.html"
								$scope.classFstButton = "";
								$scope.classSndButton = "md-raised";
                break;
            default:
								$scope.rightUrl = "./yetToSave.html"
								$scope.classFstButton = "md-raised";
								$scope.classSndButton = "";
        }

	};

// -------- GESTIONE COMMENTI ----------
	var comments = [];
	var review = [];

	var index = {
		rewIndex: "",
		comIndex: ""
	};

	$scope.updateTime = Date.now();

	$scope.addComment = function(text, ref){
		/*	comments.push(commentSrv.addComment(author, text, ref, indexes.rewIndex, indexes.comIndex));
		indexes.comIndex++;*/
	};
	$scope.save = function (){
		if(comments.length != 0){
			$http.post('wsgi/api/save', {script: comments, doc: $scope.url, author: $scope.usr["email"]})
					.success(function (status) {
						console.log("saved successfully");
						comments=[];
						$scope.curDoc="../easyRASH/templates/homepage.html";
						$mdToast.show(
					      $mdToast.simple()
					        .textContent('Annotations saved successfully!')
					        .position("bottom right" )
					        .hideDelay(3000)
					    );
					})
					// handle error
					.error(function () {
						console.log("Error during save process");
					});
		}else{
			alert("There's no comment to save");
		}
	};

  	//get all the reviews
  	function getReview(){
	  	var tutti = document.getElementsByTagName("script");
	  	for (script in tutti){
	  		if(tutti[script].type=="application/ld+json"){
	  			review.push(JSON.parse(tutti[script].innerText));
	  		}
	  	}
 	}

  	function getIndex(){
		  //la funzione prende gli indici solo se non ci sono elementi dentro la cache dei commenti
		  //la funzione viene richiamata solo una volta quando si entra in modalità annotator
		  //le successive la variabile index è sempre caricata e viene index["comIndex"] è aggiornata ogni volta che viene aggiunto un commento

		  if (comments.length == 0){
		    //cerco tra le review già esistenti se usr ha già fatto qualche review
		    getReview();

		    for(var i = 0; i< review.length; i++){
		    	//var j=review[i].length;
		    	
		    	//Questo controllo è da rivedere, al momento controlla l'ultimo oggetto dell'array che è il json della persona
		    	//Però funziona solo se questo json rimane come ultimo elemento, per come ho fatto io le cose, se il reviewer
		    	//è nuovo, questo json è il secondo.
		    	//Potrei fare un ciclo per trovare il json della persona oppure spostare il json in seconda posizione per tutti
		    	//AGGIORNAMENTO 19-11 penso che metterò il json della persona in seconda posizione
		    	if( (review[i][1]["@id"] == "mailto:"+$scope.usr["email"]) && (review[i][0]["@type"]== "review")){
		    		index["rewIndex"]=i;
		    		index["comIndex"]=review[i][0]["comments"].length;
		    		comments = review[i];
		    		break;
		    	}
		    }
		    //nuovo reviewer
		    if (index["rewIndex"]===""){
		    	index["rewIndex"]=review.length;
		    	index["comIndex"]=0;
		    	comments = commentSrv.addReview($scope.usr["email"],$scope.usr["name"]+" "+$scope.usr["surname"], index["rewIndex"]);
		    }
		}
	}

	function generateID(){
		getIndex();
		return "r"+index["rewIndex"].toString()+"c"+index["comIndex"].toString();
	}

    //functions for dialog
    $scope.annotate = function(ev) {
    	try{
	    	var selection = window.getSelection().getRangeAt(0);
	    	var confirm = $mdDialog.prompt()
	      	.title('New annotation')
	      	.placeholder('your text here')
	      	.ariaLabel('your annotation')
	      	.targetEvent(ev)
	      	.ok('Insert')
	      	.cancel('Delete');

	      	$mdDialog.show(confirm).then(function(result) {
	      		var id = generateID();
	      		var comment = commentSrv.addComment($scope.usr["email"], result, id, index["rewIndex"], index["comIndex"]);
	      		if (comment){
	      			insertSpan(selection, id);
	      			index["comIndex"] += 1;
	      			comments.push(comment);
	      			comments[0]["comments"].push(comment["@id"]);
	      		}else{
	      			alert("Something Wrong!");
	      		};

	      	}, function() {
	      		$scope.status = 'You\'re an asshole';
	      	});
	      }
	      catch(err){
	      	$mdToast.show(
		   	      $mdToast.simple()
			        .textContent('You need to select something!')
			        .position("bottom right" )
			        .hideDelay(3000)
				);
	      }
      };


    function insertSpan(selection, id){
      	var span = document.createElement("span");
      	span.className = "Mark"
      	span.appendChild(selection.extractContents());
      	span.setAttribute("id", id);
      	selection.insertNode(span);
      }

}]);
