angular.module('myApp')
	.controller("documentController",
	["annotationService", "AuthService", "dialogService", "domService", 
	"$scope","$sce","$http","$mdSidenav", "$mdDialog", "$interval", "$timeout",
	function(annotationService, AuthService, dialogService, domService, 
		$scope,$sce,$http,$mdSidenav, $mdDialog, $interval, $timeout){

	//-------- SEND EDITED DATA ---------
	$scope.changeform={
 			given_name: "",
 			family_name: "",
 			oldemail: "",
 			email: "",
 			oldpass: "",
 			pass: "",
 		};

 	$scope.edit = function(){

 	}

	//-------- MODIFICA DATI ------------
	$scope.showAdvanced = function(ev) {
		$mdDialog.show({
			controller: DialogController,
			templateUrl: '../easyRASH/templates/authentication/datachange.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:true,
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

	//-------- GESTIONE LOGOUT ----------
	$scope.logout=function(){
		AuthService.logout();
	};

	//-------- USER MENU ----------------
	var originatorEv;

	$scope.openMenu = function($mdOpenMenu, ev){
		originatorEv = ev;
		$mdOpenMenu(ev);
	};

	// ------- GESTIONE UTENTE ----------

	//Carico utenti e documenti
	 $http.get("api/getUser").success(function(data,status,headers,config){
		$scope.usr = data;
	 	$scope.updateDocs();
	 });

	 // --------- GESTIONE VISUALIZZAZIONE DOC ------------
	 //Visualizzo pagina di presentazione -> FORSE DA TOGLIERE PERCHè TANTO LA FA POCO PIù GIU
 	$scope.curDoc="../easyRASH/templates/document/homepage.html";

	//Aggiorna i documenti
	$scope.updateDocs=function(){
		$http.get("api/getDocs").success(function(data,status,headers,config){
			$scope.documents=data.ret;
		});
	};

	$scope.homepage = function(){
		$scope.curDoc="../easyRASH/templates/document/homepage.html";
		$scope.title="easyRASH";
		$scope.annotatorbutton=false;
	};
	$scope.homepage();

	$scope.statusColor = function(status) {
		if (status === "REJECTED") return{"color": "#F44336" };
		else {
			if (status === "ACCEPTED") return{"color": "#4CAF50" };
			else return {"color": "#FFC107" };	
		}
	};

	// ------------- GESTIONE SIDENAV -----------------
	//      VORREI METTERLO IN UN CTRL A PARTE
	
	oldUrl = "";
	
	//Carica e chiude il sidenav di sinistra
	$scope.leftMenu = function(par, url, role, title, ev) {
		if(par=="close"){
			$mdSidenav('left').close();
			$scope.curDoc = "../easyRASH/static/papers/"+url;
			$scope.annotatorbutton=true;
			$scope.url=url;
			$scope.role=role;
			$scope.title=title;
			$scope.ev= ev;
			//'?updated='+Date.now() serve per bypassare la cache, 
			//in modo che ogni volta che si preme il bottone, si ricarica il documento
			//Se non si fa, non si vedono le annotazioni appena fatte
			$scope.curDoc = "../easyRASH/static/papers/"+url+'?updated='+Date.now();
			//Ogni volta che aggiorno il documento riazzero le variabili (per sicurezza)
			comments = [];
			review = [];
			decision = [];
			index["rewIndex"] ="";
			index["comIndex"] ="";

			//Conto il numero di reviewer del paper
			//vorrei fare questo controllo solo se l'user è un chair, però vabbè!
			$http.get("api/getReviewers", {params: {"url":$scope.url, "event":$scope.ev}})
			.success(function(data,status,headers,config){
				reviewers=data["ret"];	
			});


			//Roba che ha fatto Olga per il mutex
			if ((url != oldUrl) && (oldUrl != "")) {
				esci(oldUrl);
				oldUrl=angular.copy(url);
				
			}
			oldUrl=angular.copy(url);
			


		}
		else{
			$mdSidenav('left').toggle();
		}
	};

// -------- GESTIONE COMMENTI ----------
	var comments = [];
	var review = [];
	var decision = [];
	var reviewers = []

	var index = {
		rewIndex: "",
		comIndex: ""
	};

  	function getIndex(){
		  //la funzione prende gli indici solo se non ci sono elementi dentro la cache dei commenti
		  //la funzione viene richiamata solo una volta quando si entra in modalità annotator
		  //le successive la variabile index è sempre caricata e viene index["comIndex"] è aggiornata ogni volta che viene aggiunto un commento
		  $scope.inReview = false;

		  if (comments.length == 0){
		    //cerco tra le review già esistenti se usr ha già fatto qualche review
		    if(review.length == 0) review = domService.getReview();
		    for(var i = 0; i< review.length; i++){
		    	if( (review[i][1]["@id"] == "mailto:"+$scope.usr["email"]) && (review[i][0]["@type"]== "review")){
		    		index["rewIndex"]=i;
		    		index["comIndex"]=review[i][0]["comments"].length;
		    		comments = review[i];
		    		$scope.inReview = true;
		    		break;
		    	}
		    }
		    //nuovo reviewer
		    if (index["rewIndex"]===""){
		    	index["rewIndex"]=review.length;
		    	index["comIndex"]=0;
		    	comments = annotationService.addReview($scope.usr["email"],$scope.usr["name"]+" "+$scope.usr["surname"], index["rewIndex"]);
		    }
		}
	}

	function generateID(){
		getIndex();
		return "r"+index["rewIndex"].toString()+"c"+index["comIndex"].toString();
	}

	$scope.save = function (ev){
		if(comments.length != 0){
			var sections = domService.getSections();
			annotationService.sendScript(comments, "review", "Annotations", sections, $scope.url, $scope.usr["email"]);
			if (comments[0]["article"]["eval"]["status"] != ""){
				console.log("controllo se devo aggiornare lo status");
				if(review.length == reviewers.length || 
					(!$scope.inReview && (reviewers.length == review.length + 1 ))){

					var finished = true;
					for (rev in review){
						if(review[rev][0]["article"]["eval"]["status"] == ""){
							finished = false;
							break;
						}
					}
					if (finished){
						annotationService.updateStatus("AWAITING DECISION", $scope.ev, $scope.url).success(
							function(response){
								$scope.updateDocs();
								console.log("status updated");
							});
					}
				}
			}
			$scope.homepage();
		}else{
			if (decision.length != 0) { 
				annotationService.sendScript(decision, "decision", "Decision", [], $scope.url, $scope.usr["email"]);
				annotationService.updateStatus(decision[0]["article"]["eval"]["status"], $scope.ev, $scope.url).success(
					function(response){
						$scope.updateDocs();
						$scope.homepage();
						console.log("status updated");
				});
			}else{
				dialogService.showAlertDialog(ev, "Hey!","There's nothing to save!", "nothing to save","Got it!");
			}
		}
	};

    //Create annotation
    $scope.annotate = function(ev) {
    	try{
	    	var selection = window.getSelection().getRangeAt(0);
	    	if(selection["startOffset"]==selection["endOffset"]) new UserException("Empty Selection")
	    	
	    	if ((selection.commonAncestorContainer.nodeName != "P") && (selection.commonAncestorContainer.nodeName != "#text")) {
	    		dialogService.showSimpleToast("You can add a comment only in one paragreph at a time");
	    		return;
	    	}
	    	
	    	var confirm = $mdDialog.prompt()
		      	.title('New annotation')
		      	.placeholder('your text here')
		      	.ariaLabel('your annotation')
		      	.targetEvent(ev)
		      	.ok('Insert')
		      	.cancel('Delete');

	      	$mdDialog.show(confirm).then(function(result) {
	      		var id = generateID();
	      		var comment = annotationService.addComment($scope.usr["email"], result, id, index["rewIndex"], index["comIndex"]);
	      		if (comment){
	      			domService.insertSpan(selection, id);
	      			index["comIndex"] += 1;
	      			comments.push(comment);
	      			comments[0]["comments"].push(comment["@id"]);
	      		}else{
	      			dialogService.showAlertDialog(ev, "Error!", "Something Wrong!", "annotation error", "quit");
	      		};

	      	}, function() {
				return;
		  	});
	      }
	      catch(err){
	      	dialogService.showSimpleToast('You need to select something!');
	      }
      };

    $scope.decide = function(ev) {

		if(review.length == 0) review = domService.getReview();
    	//Caso in cui non tutti i reviewer hanno fatto commenti
    	if(review.length != reviewers.length){
    		dialogService.showSimpleToast('There are reviews missing');
    	}else{	    
    		var completed = true;
    		var rejected = "";
    		for (script in review){
    			//Cerco se qualche reviewer ha fatto delle review senza giudizio
    			var status = review[script][0]["article"]["eval"]["status"]
    			if (status == ""){
    				completed = false;
    				break
    			}
    			//Salvo i reviewer che non hanno accettato il paper
    			if (status == "rejected"){
    				rejected = rejected + "\n" +review[script][1]["name"];
    			}
    		}
    		if (completed){

    			var finalDecision = "";
    			dialogService.showConfirmDialog(ev, "Accept", "Reject", "Make your decision", "","Final decision", "accepted", "rejected")
    			.then(function(result){

					finalDecision = result;

	    			if (finalDecision=="accepted"){
	    				//Se il chair vuole accettare ma ci sono reviewer che non hanno approvato, chiedo conferma
	    				if(rejected != ""){
	    					dialogService.showConfirmDialog(ev, "Continue anyway", "I'll think about it", "WARNING", "These reviewers have rejected the paper: \n"+rejected, "Paper rejected by reviewers", "pass", "stop")
	    					.then(function(result){
	    						//Essendo il dialog più lento, nel caso deciso di annullare la decisione, sovrascrivo la decisione fatta più sotto
								if(result=="stop") decision=[];
							});
	    				}
	    			}
	    			//La decisione viene creata in qualsiasi caso
    				decision = annotationService.addDecision($scope.usr["email"], $scope.usr["name"]+" "+$scope.usr["surname"], finalDecision, reviewers.length);
	 			});
    		}
			else{
				//Non tutti i review hanno dato un giudizio
    			dialogService.showSimpleToast('You must wait for all the reviewers to judge the paper!');
			}
		}
	};

	$scope.judge = function(ev){
		//generateID oltre a calcolare gli indici crea anche la review se non c'è
		//questo serve nel caso uno fa un giudizio senza fare nessun annotazione o altri casi minori
		generateID();

		dialogService.showConfirmDialog(ev, "Accept", "Reject", "Overall judgement", "", "Overall judgement", "accepted", "rejected")
			.then(function(result){
				comments[0]["article"]["eval"]["status"] = result;
			});
	};

    
//----------- GESTIONE ANNOTATOR ------------------

	$scope.buttonText="Annotator";
	$scope.variab = false;

	$scope.clicca = function (url, role) {
		
		if (!$scope.variab) {
			$scope.buttonText="Reader";
			mutex(url,role);		
		}
		else if ($scope.variab) {
			$scope.buttonText="Annotator";
			esci(url);		
		}
	
	};
	
	
	var timer;
	var timeUrl;
	var timer2;
	
	var mutex = function(url, role) {
    	
    	timer=$timeout(function(){
    		
    		timeUrl=angular.copy(url);
    		timer2=$timeout(function() {esci(timeUrl)}, 60000); //1 minuto
    		var confirm;
    		confirm = $mdDialog.confirm()
    			.title("Do you want to keep working?")
				.textContent("Annotator mode will be automatically deactivated in 60 seconds")
				.ok("Annotator mode")
				.cancel("Exit");
    
    		$mdDialog.show(confirm).then(function() {
      			
      			$timeout.cancel(timer2);
      			mutex(url,role);
    		});
    		
    		
    	}, 1800000); //30 minuti
    	
		$http({method:'POST', url:"api/annotMode", params:{"url": url, "role": role, "usr":$scope.usr.email}})
			// handle success
			.success(function (data, status) {

    		    $scope.variab=data.result;
    		    if (!($scope.variab)) {
    		      if (role!="Reviewer " && role !="Chair ") {
    		        alert("You don't have permission to make annotations");
    		      }
    		      	else {
    		       		 alert("Somebody else is reviewing this document. Pleas try again later ");
    	      		}
    	    	}
			})
			// handle error
			.error(function (data, status) {
				console.log(status)
			});
	};
	
	
	var esci = function(url){
  		
  		$interval.cancel(timer);
  		
  		$http({method:'POST', url:'api/esci', params:{"url": url}})
  		// handle success
  		.success(function (data, status) {

       		$scope.variab=data.result;
       		
       		


  		})
  		// handle error
  		.error(function (data) {
    		console.log(status)
  		});
  		
  		

	};

	



}]);
