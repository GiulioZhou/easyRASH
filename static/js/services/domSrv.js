//define dialog and toast service
var app = angular.module('myApp').factory('domService',
	['$mdDialog', "$mdToast",
	function ($mdDialog, $mdToast) {

		// return available functions for use in controllers
		return ({
			insertSpan: insertSpan,
			getSections: getSections,
			getReview: getReview
		});

		function insertSpan(selection, id){
	      	var span = document.createElement("span");
	      	span.className = "highlight";
	      	span.appendChild(selection.extractContents());
	      	span.setAttribute("id", id);
	      	selection.insertNode(span);
    	}

    	function getSections (){
			var all = document.getElementsByTagName("section");
			var section = [];
			for (sec in all){
				if(all[sec].parentElement != undefined && all[sec].parentElement.id=="paper"){
					all[sec].removeAttribute("class");
					section.push(all[sec].outerHTML);
				}
			}
			return section;
		}
		//get all the reviews
	  	function getReview(){
	  		var review=[];
		  	var tutti = document.getElementsByTagName("script");
		  	for (script in tutti){
		  		if(tutti[script].type=="application/ld+json"){
		  			var jsonReview = JSON.parse(tutti[script].innerText);
		  			//Inserisco solo le review
		  			//In realtà non credo che serva, in quanto una volta inserita una decisione questa è finale
		  			//Al momento però per fare i test meglio lasciarlo
		  			if(jsonReview[0]["@type"] == "review") review.push(jsonReview);
		  		}
		  	}
		  	return review;
	 	}
}]);
