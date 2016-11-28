angular.module('myApp')
	.controller("annotController",["commentSrv", "userSrv", "$scope","$sce","$http",
		function(commentSrv, userSrv, $scope, $sce, $http){
		
		var usr = userSrv.getUsr();
		
		var comments = [];
	    var review = [];


	    var index = {
	      rewIndex: "",
	      comIndex: ""
	    };

		$scope.addComment = function(text, ref){
			comments.push(commentSrv.addComment(author, text, ref, indexes.rewIndex, indexes.comIndex));
			indexes.comIndex++;
		};


		$scope.save = function (){
		
			//questa dovrebbe cercarenel rush se c'è già una review, se non c'è crearne una nuova con la addReview altrimenti aggiungere
			//solo i campi modificando il rush
			
		};

  	//get all the reviews
      var tutti = document.getElementsByTagName("script");
        for (script in tutti){
          if(tutti[script].type=="application/ld+json"){
            review.push(JSON.parse(tutti[script].innerText));
          }
        }


		function generateID(){
		  //la funzione prende gli indici solo se non ci sono elementi dentro la cache dei commenti
		  //la funzione viene richiamata solo una volta quando si entra in modalità annotator
		  //le successive la variabile index è sempre caricata e viene index["comIndex"] è aggiornata ogni volta che viene aggiunto un commento

		  if (comments.length == 0){
		    //cerco tra le review già esistenti se usr ha già fatto qualche review
		    for(var i = 0; i< review.length; i++){
		      var j=review[i].length;
		      if( (review[i][j-1]["@id"] == "mailto:"+usr["email"]) && (review[i][0]["@type"]== "review")){
		        index["rewIndex"]=i;
		        index["comIndex"]=review[i][0]["comments"].length;
		        break;
		      }
		    }
		    //nuovo reviewer
		    if (index["rewIndex"]==""){
		      index["rewIndex"]=review.length;
		      index["comIndex"]=0;
		    }
		  }
		}


		function insertSpan(selection){
		  var span = document.createElement("span");
		  span.className = "evidenziato"
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
}]);
