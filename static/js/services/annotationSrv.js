var app = angular.module('myApp').factory("annotationService", ["$filter", "$http", "dialogService", "domService",
    function($filter, $http, dialogService, domService) {

        return ({
            addComment: addComment,
            addReview: addReview,
            addDecision: addDecision,
            sendScript: sendScript,
            updateStatus: updateStatus
        });

        var review;
        var counter;

        function currentDate() {
            return $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        }

        function createPerson(mail, fullName, rewIndex, role) {
            return ({
                "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
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
        }

        function addComment(author, text, ref, rewIndex, comIndex) {
            var comment;
            var date = currentDate();
            comment = {
                "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
                "@type": "comment",
                "@id": "#review" + rewIndex + "-c" + comIndex,
                "text": text,
                "ref": ref,
                "author": "mailto:" + author,
                "date": date
            };
            return comment;
        }

        function addReview(author, fullName, rewIndex, role) {
            var date = currentDate();
            var person = createPerson(author, fullName, rewIndex, role);
            var review = [{
                "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
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
                "comments": [],
                "n_deletedComments": 0

            }];
            review.push(person);
            return review;
        }

        function addDecision(author, fullName, status, rewIndex) {
            var date = currentDate();
            var person = createPerson(author, fullName, rewIndex, "chair");
            var decision = [{
                "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
                "@type": "decision",
                "@id": "#decision",
                "article": {
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
            }];
            decision.push(person);
            return decision;
        };

        function sendScript(script, type, text, sections, url, email) {
            $http.post('api/save', { script: script, doc: url, author: email, sections: sections, type: type })
                .success(function(status) {                	
                    dialogService.showSimpleToast(text + " successfully submitted");
                })
                .error(function() {
                    dialogService.showSimpleToast("There's a problem during da save process");
                });
        }

        function updateStatus(stat, ev, paper) {
            var status = stat;
            if (stat === "pso:accepted-for-publication") status = "ACCEPTED";
            else {
                if (stat === "pso:rejected-for-publication") status = "REJECTED";
            }
            return $http.post('api/updateStatus', { paper: paper, ev: ev, status: status });
        }
    }
])
