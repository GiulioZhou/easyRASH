angular.module('myApp')

	.filter('currentDate',['$filter',  function($filter) {
		return function() {
		    return $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'); 
		};
	}])

	.service("commentSrv", ['currentDate', function (currentDate){
		var review;
		var counter;
		var context = "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json";
		
		
		var createPerson = function (mail, fullName, rewIndex, role){
			return (
			{
          		"@context": context,
          		"@type": "person",
          		"@id": "mailto:" + mail,
          		"name": fullName,
          		"as": {
          			"@id": "#role" + rewIndex,
          			"@type": "role",
          			"role_type": "pro:" + role,
          			"in": ""
          		}
            });
		};
		/* return a new comment to current paper
			author = author of the comment
			text = text of the comment
			ref = position of the comment 
			rewIndex , comIndex =counter to identify review and comment
		*/ 
		this.addComment = function (author, text, ref, rewIndex, comIndex){
			var comment;
			
			var date = currentDate();
			
			comment ={
              		"@context": context,
              		"@type": "comment",
              		"@id": "#review" + rewIndex + "-c" + comIndex,
              		"text": text,
              		"ref": ref,
              		"author": "mailto:" + author,
              		"date": date
             };
              
			return comment;
		
		};
		
		/* return a new review to current paper
			author = author of the review
			fullName = author's name and surname
			rewIndex =counter to identify review 
		*/ 
		this.addReview = function (author, fullName, rewIndex){
		
			var date = currentDate();
			var person = createPerson(author, fullName, rewIndex, "reviewer");
			
			var review = [
			{
          		"@context": context,
          		"@type": "review",
          		"@id": "#review" + rewIndex,
          		"article": {
          			"@id": "", 
          			"eval": {
          				"@id": "#review" + rewIndex + "-eval",
          				"@type": "score",
          				"status": "",
          				"author": "mailto:" + author,
          				"date": date
          			}
          		},
          		"comments": []
            }];
            
            review.push(person);
            
            return review;          
		
		};
		
		/* return a decision for current paper
			author = author of the decision
			fullName = chair's name and surname
			status = accepted/rejected
			rewIndex = number of completed reviews
			artIndex = counter to identify this article in the conference
		*/ 
		this.addDecision = function (author, fullName, status, rewIndex, artIndex){
		
			var date = currentDate();
			
			var person = createPerson(author, fullName, rewIndex, "chair");
		
			var decision=[
                {
              		"@context": context,
              		"@type": "decision",
              		"@id": "#decision" + artIndex,
              		"article": {
              			"@id": "",
              			"eval": {
              				"@context": "easyrash.json",
              				"@id": "#decision" + artIndex + "-eval",
              				"@type": "score",
              				"status": "pso:" + status,
              				"author": "mailto:" + author,
              				"date": date
              			}
              		}
             	}
             ];
             
             decision.push(person);
            
             return decision; 
		
		};
	
	})


	.controller("annotController",["commentSrv", "$scope","$sce","$http",function(commentSrv, $scope,$sce,$http){
		var comments = [];
		
		$scope.addComment = function(){
			comment.push(commentSrv.addComment(author, text, ref, rewIndex, comIndex));
		
		}
		
		
		$scope.save = function (){
		
		
		};
		
	retUsr
	}]);

