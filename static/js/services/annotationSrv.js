//Service for reviews and decisions
var app = angular.module('myApp').factory("annotationService",
  ["$filter", "$http", "dialogService", "domService",
  function ($filter, $http, dialogService, domService){

    // return available functions for use in controllers
    return ({
      addComment: addComment,
      addReview: addReview,
      addDecision: addDecision,
      sendScript: sendScript,
      updateStatus: updateStatus
    });
  
    var review;
    var counter;
    var context = "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json";

    function currentDate(){
      return $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
    }

    function createPerson (mail, fullName, rewIndex, role){
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
        }
      );
    }

		/* return a new comment to current paper
			author = author of the comment
			text = text of the comment
			ref = position of the comment
			rewIndex , comIndex = counters to identify review and comment	*/
    function addComment (author, text, ref, rewIndex, comIndex){
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
    }

		/* return a new review to current paper
			author = author of the review
			fullName = author's name and surname
			rewIndex =counter to identify review 	*/
    function addReview (author, fullName, rewIndex){
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
    }

		/* return a decision for current paper
			author = author of the decision
			fullName = chair's name and surname
			status = accepted/rejected
			rewIndex = number of completed reviews
			artIndex = counter to identify this article in the conference	*/   
    function addDecision(author, fullName, status, rewIndex){
      var date = currentDate();
      var person = createPerson(author, fullName, rewIndex, "chair");
      var decision=[
        {
          "@context": context,
          "@type": "decision",
          "@id": "#decision",
          "article":{
            "@id": "",
            "eval": {
              "@context": "easyrash.json",
              "@id": "#decision-eval",
              "@type": "score",
              "status": "pso:" + status + "-for-publication",
              "author": "mailto:" + author,
              "date": date
            }
          }
        }
      ];
      decision.push(person);
      return decision;
    };

    function sendScript(script, type, text, sections, url, email){
      $http.post('wsgi/api/save', {script: script, doc: url, author: email, sections: sections, type: type})
        .success(function (status) {
          dialogService.showSimpleToast(text+" successfully submitted");
        })
        // handle error
        .error(function () {
          dialogService.showSimpleToast("There's a problem during da save process");
        });
    }

    function updateStatus(stat, ev, paper){
      var status = stat;
      if (stat === "pso:accepted-for-publication") status="ACCEPTED";
      else{
        if (stat === "pso:rejected-for-publication") status="REJECTED";
      }
      console.log(paper);
      console.log(ev);
      console.log(status);

      return $http.post('wsgi/api/updateStatus', {paper: paper, ev: ev, status: status});
    }
}])
