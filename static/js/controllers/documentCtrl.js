angular.module('myApp')
    .controller("documentController", ["annotationService", "AuthService", "dialogService", "domService",
        "$scope", "$http", "$mdSidenav", "$mdDialog", "$interval", "$timeout", "$location", "$mdToast", "$rootScope",
        function(annotationService, AuthService, dialogService, domService,
            $scope, $http, $mdSidenav, $mdDialog, $interval, $timeout, $location, $mdToast, $rootScope) {

            // ------- Carica l'utente ----------
            $scope.role = " ";
            $scope.usr = {};
            $scope.curDoc = "";
            $rootScope.inProgress = true;

            AuthService.updateUser().then(function(data) {
                $scope.usr = data;
                $scope.title = "Welcome " + $scope.usr["name"];
                $scope.updateDocs();
            });

            // --------- GESTIONE VISUALIZZAZIONE ------------
            var oldUrl = "";

            $scope.updateDocs = function() {
                $http.get("api/getDocs").success(function(data, status, headers, config) {
                    $scope.documents = data.ret;
                    $rootScope.inProgress = false;
                });
            };

            function resetHome() {
                $scope.annotatorbutton = false;
                if (oldUrl != "") escAnnotator(oldUrl);
                $scope.review = [];
                $scope.notsaved = [];
            }

            $scope.help = function() {
                $scope.curDoc = "../easyRASH/templates/document/help.html";
                $scope.title = "How to easyRASH";
                $scope.isHome = true;
                resetHome();
            };

            $scope.homepage = function() {
                $scope.curDoc = "../easyRASH/templates/document/homepage.html";
                $scope.title = "Welcome " + $scope.usr["name"];
                $scope.isHome = true;
                resetHome();
            };
            $scope.homepage();

            // ------------- GESTIONE SIDENAV -----------------
            $scope.leftMenu = function(par, url, role, title, ev, docStatus, fChair, fRev, fAuth) {
                //Caso apertura paper
                if (par == "close") {
                    $mdSidenav('left').close();
                    $scope.isHome = false;

                    //non si può accedere in modalità annotator se il Chair ha deciso
                    if (docStatus == "AWAITING DECISION" || docStatus == "UNDER REVIEW") $scope.annotatorbutton = true;
                    else $scope.annotatorbutton = false;

                    //Carico dati paper
                    $scope.docStatus = docStatus;
                    $scope.url = url;
                    $scope.role = role;
                    $scope.fChair = fChair;
                    $scope.fRev = fRev;
                    $scope.fAuth = fAuth;
                    $scope.title = title;
                    $scope.ev = ev;

                    //'?updated='+Date.now() serve per bypassare la cache, in modo che ogni volta che si preme il bottone, si ricarica il documento. Se non si fa, non si vedono le annotazioni appena fatte
                    $scope.curDoc = "../easyRASH/static/papers/" + url + '?updated=' + Date.now();

                    //Reset delle variabili 
                    comments = [];
                    $scope.review = [];
                    decision = [];
                    index["rewIndex"] = "";
                    index["comIndex"] = "";
                    modified = 0;
                    oldId = 0;
                    first = true;

                    //Conto il numero di reviewer del paper
                    $http.get("api/getReviewers", { params: { "url": $scope.url, "event": $scope.ev } })
                        .success(function(data, status, headers, config) {
                            reviewers = data["ret"];
                        });

                    //Serve per chiudere la modalità annotator del vecchio documento aperto (in caso di uscita senza ritornare in modalità reader)
                    if ((url != oldUrl) && (oldUrl != "")) {
                        escAnnotator(oldUrl);
                        oldUrl = angular.copy(url);
                    }
                    oldUrl = angular.copy(url);

                    //Genero un delay per aspettare che il documento si carichi prima di determinare i reviews
                    $timeout(function() {
                        id = generateID();
                    }, 500);

                } else {
                    $mdSidenav('left').toggle();
                }
            };

            //Decide se visualizzare il nome del reviewer nell'annotazione
            $scope.viewName = function(name) {
                if (name == ($scope.usr["name"] + " " + $scope.usr["surname"]) || $scope.fChair) return true;
                return false;
            };

            // -------- GESTIONE COMMENTI ----------
            var comments = [];
            $scope.notsaved = [];
            $scope.review = [];
            var decision = [];
            var reviewers = []
            var id;
            var modified = 0;
            var oldId = 0;
            var index = {
                rewIndex: "",
                comIndex: ""
            };
            var first = true;

            function getIndex() {
                first = false;
                $scope.inReview = false;

                //Cerca tra le review già esistenti se lo user corrente ha già fatto qualche review
                if ($scope.review.length == 0) $scope.review = domService.getReview();
                for (var i = 0; i < $scope.review.length; i++) {
                    if (($scope.review[i][1]["@id"] == "mailto:" + $scope.usr["email"]) && ($scope.review[i][0]["@type"] == "review")) {
                        index["rewIndex"] = i;

                        //n_deletedComments conta commenti eliminati
                        //l'indice partirà sempre dall'ultima annotazione per evitare conflitti
                        index["comIndex"] = $scope.review[i][0]["comments"].length + $scope.review[i][0]["n_deletedComments"];
                        comments = $scope.review[i];
                        $scope.inReview = true;
                        break;
                    }
                }

                //nuovo reviewer
                if (index["rewIndex"] === "") {
                    index["rewIndex"] = $scope.review.length;
                    index["comIndex"] = 0;
                    var newrole;
                    if ($scope.fChair == 1) newrole = "chair";
                    if ($scope.fRev == 1) newrole = "reviewer";
                    comments = annotationService.addReview($scope.usr["email"], $scope.usr["name"] + " " + $scope.usr["surname"], index["rewIndex"], newrole);
                }
            }

            function generateID() {
                if (first) getIndex();
                return "r" + index["rewIndex"].toString() + "c" + index["comIndex"].toString();
            }

            function getComment(id) {
                var i = -1;

                for (rev in $scope.review) {
                    for (com in $scope.review[rev]) {
                        if ($scope.review[rev][com]["@type"] == "comment") {
                            if ($scope.review[rev][com]["ref"] == id) {
                                return { rev: rev, com: com };
                            }
                        }
                    }
                }
                for (comment in $scope.notsaved) {
                    if ($scope.notsaved[comment]["ref"] == id) {
                        return { rev: "notsaved", com: comment };
                    }
                }

                return i;
            }


            $scope.save = function(ev) {
                //prima di salvare ripristino il colore originale
                if (oldId != 0) resetColour(oldId);

                if (modified) {
                    var sections = domService.getSections();
                    comments = comments.concat($scope.notsaved);
                    annotationService.sendScript(comments, "review", "Annotations", sections, $scope.url, $scope.usr["email"]);
                    if (comments[0]["article"]["eval"]["status"] != "") {
                        var finished = true;
                        var i = 0;
                        for (rev in $scope.review) {
                            if ($scope.review[rev][1]["as"]["type_role"] != "pro:chair") {
                                i++;
                                if ($scope.review[rev][0]["article"]["eval"]["status"] == "") {
                                    console.log($scope.review[rev][1]["as"]["type_role"]);
                                    finished = false;
                                    break;
                                }
                            }
                        }

                        if ((finished && (i == reviewers.length)) || (!$scope.inReview && (reviewers.length == i + 1))) {
                            annotationService.updateStatus("AWAITING DECISION", $scope.ev, $scope.url).success(
                                function(response) {
                                    $scope.updateDocs();
                                    console.log("status updated");
                                });
                        }

                    }

                    if (decision.length != 0) {
                        annotationService.sendScript(decision, "decision", "Decision", [], $scope.url, $scope.usr["email"]);
                        annotationService.updateStatus(decision[0]["article"]["eval"]["status"], $scope.ev, $scope.url).success(
                            function(response) {
                                $scope.updateDocs();
                                $scope.homepage();
                                console.log("status updated");
                            });
                    }

                    $scope.homepage();

                } else {

                    dialogService.showAlertDialog(ev, "Hey!", "There's nothing to save!", "nothing to save", "Got it!");

                }
            };

            //Create annotation
            $scope.annotate = function(ev) {
                try {
                    var selection = window.getSelection().getRangeAt(0);
                    if (selection["startOffset"] == selection["endOffset"]) new UserException("Empty Selection")

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
                        id = generateID();
                        var comment = annotationService.addComment($scope.usr["email"], result, id, index["rewIndex"], index["comIndex"]);
                        if (comment) {
                            domService.insertSpan(selection, id);
                            index["comIndex"] += 1;
                            $scope.notsaved.push(comment);
                            comments[0]["comments"].push(comment["@id"]);
                            modified = 1;
                        } else {
                            dialogService.showAlertDialog(ev, "Error!", "Something Wrong!", "annotation error", "quit");
                        };

                    }, function() {
                        return;
                    });
                } catch (err) {
                    dialogService.showSimpleToast('You need to select something!');
                }
            };

            //Giudizio del chair
            $scope.decide = function(ev) {
                var rejected = "";
                for (script in $scope.review) {
                    var status = $scope.review[script][0]["article"]["eval"]["status"]
                        //Si salvano i reviewer che non hanno accettato il paper
                    if (status == "rejected") {
                        rejected = rejected + "\n" + $scope.review[script][1]["name"];
                    }
                }
                var finalDecision = "";
                dialogService.showConfirmDialog(ev, "Accept", "Reject", "Make your decision", "", "Final decision", "accepted", "rejected")
                    .then(function(result) {

                        finalDecision = result;

                        if (finalDecision == "accepted") {
                            //Se il chair vuole accettare ma ci sono reviewer che non hanno approvato, chiedo conferma
                            if (rejected != "") {
                                dialogService.showConfirmDialog(ev, "Continue anyway", "I'll think about it", "WARNING", "These reviewers have rejected the paper: \n" + rejected, "Paper rejected by reviewers", "pass", "stop")
                                    .then(function(result) {
                                        //Essendo il dialog più lento, nel caso deciso di annullare la decisione, sovrascrive la decisione fatta più sotto
                                        if (result == "stop") {
                                            decision = [];
                                            modified = 0;
                                        }
                                    });
                            }
                        }
                        //La decisione viene creata in qualsiasi caso
                        decision = annotationService.addDecision($scope.usr["email"], $scope.usr["name"] + " " + $scope.usr["surname"], finalDecision, reviewers.length);
                        modified = 1;
                    });

            };

            //Giudizio del reviewer
            $scope.judge = function(ev) {
                dialogService.showConfirmDialog(ev, "Accept", "Reject", "Overall judgement", "", "Overall judgement", "accepted", "rejected")
                    .then(function(result) {
                        comments[0]["article"]["eval"]["status"] = result;
                        modified = 1;
                    });
            };

            //Chiude il sidenav per visualizzare il commento
            $scope.sidenavAnnotation = function(id) {
                $mdSidenav('left').toggle();
                $scope.viewAnnotation(id);
            }

            $scope.viewAnnotation = function(id) {

                if (oldId != 0) resetColour(oldId);
                var i = getComment(id);
                if (i == -1) {
                    dialogService.showSimpleToast('error with the id');
                } else {
                    scroll(id);
                    if (i["rev"] == "notsaved") {
	                    $scope.content = $scope.notsaved[i["com"]]["text"];

                    } else {
                        $scope.content = $scope.review[i["rev"]][i["com"]]["text"];
                    }                    
                    
                    oldId = id;
                    
                    $mdToast.show({
	                    hideDelay: 0 ,
					 	position    : 'bottom right',
					 	templateUrl : '/easyRASH/templates/document/annotationToast.html'
					});
					
					var toast = $mdToast.simple()
					  .textContent($scope.content)
					  .action('CLOSE')
					  .highlightAction(true)
					  .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
					  .position("bottom right");

				    $mdToast.show(toast).then(function(response) {
				      if ( response == 'ok' ) {
				        $mdToast.hide(toast);
				      }
				    });
					 
					 
                    setBgColour(document.getElementById(id), 255, 178, 102, 0.5);
                }
            };

            //Elimina lo span di un'annotazione
            function unWrap(id) {
                var wrap = $('#' + id);
                var text = wrap.text();
                wrap.replaceWith(text);
            }

            $scope.removeAnnotation = function(id) {
                var i = getComment(id);
                if (i == -1) {
                    dialogService.showSimpleToast('error with the id');
                } else {
                    if (i["rev"] == "notsaved") {
                        $scope.notsaved.splice(i["com"], 1);
                        comments[0]["comments"].splice(i["com"], 1);
                        comments[0]["n_deletedComments"]++;
                    } else {

                        comments.splice(i["com"], 1);
                        $scope.review[i["rev"]][0]["comments"].splice(i["com"], 1);
                        $scope.review[i["rev"]][0]["n_deletedComments"]++;
                        modified = 1;
                    }
                    unWrap(id);
                    dialogService.showSimpleToast('Annotation removed! Remember to save your changes!');
                }
            };

            $scope.editAnnotation = function(id) {
                var i = getComment(id);
                if (i == -1) {
                    dialogService.showSimpleToast('error with the id');
                } else {
                    var confirm = $mdDialog.prompt()
                        .title('Edit annotation')
                        .placeholder('your text here')
                        .ariaLabel('edit annotation')
                        .ok('Edit')
                        .cancel('Delete');
                    $mdDialog.show(confirm).then(function(result) {
                        if (i["rev"] == "notsaved") {
                            $scope.notsaved[i["com"]]["text"] = result;
                        } else {
                            comments[i["com"]]["text"] = result;
                        }
                        modified = 1;
                        dialogService.showSimpleToast('Annotation modified! Remember to save your changes!');
                    }, function() {
                        return;
                    });
                }
            };


            //----------- GESTIONE ANNOTATOR ------------------

            $scope.buttonText = "Annotator";
            $scope.buttonTextS = "A";
            $scope.annMode = false;

            $scope.annotatorAction = function(url, role) {
                if (!$scope.annMode) {
                    $scope.buttonText = "Reader";
                    $scope.buttonTextS = "R";
                    mutex(url, role);
                } else if ($scope.annMode) {
                    escAnnotator(url);
                }
            };

            var timer;
            var timeUrl;
            var timer2;

            function mutex(url, role) {

                timer = $timeout(function() {
                    timeUrl = angular.copy(url);
                    timer2 = $timeout(function() { escAnnotator(timeUrl) }, 60000); //1 minuto
                    var confirm = $mdDialog.confirm()
                        .title("Are you still here?")
                        .textContent("Annotator mode will be automatically deactivated in 60 seconds")
                        .ok("Annotator mode")
                        .cancel("Close");

                    $mdDialog.show(confirm).then(function() {

                        $timeout.cancel(timer2);
                        mutex(url, role);
                    });
                }, 1800000); //30 minuti

                $http({ method: 'POST', url: "api/annotMode", params: { "url": url, "role": role, "usr": $scope.usr.email } })
                    .success(function(data, status) {

                        $scope.annMode = data.result;
                        //Carica le annotazioni fatte da altri 
                        $scope.curDoc = "../easyRASH/static/papers/" + $scope.url + '?updated=' + Date.now();
                        if (!($scope.annMode)) {
                            if (role == "Author ") {
                                $scope.buttonText = "Annotator";
                                $scope.buttonTextS = "A";
                                $timeout.cancel(timer);
                                dialogService.showAlertDialog(null, "Hey!", "You don't have permission to make annotations", "no permission", "Got it!");
                            } else {
                                $scope.buttonText = "Annotator";
                                $scope.buttonTextS = "A";
                                $timeout.cancel(timer);
                                dialogService.showAlertDialog(null, "Hey!", "Somebody else is reviewing this document. Pleas try again later ", "annotator mode busy", "Got it!");
                            }
                        }
                    })
                    .error(function(data, status) {
                        console.log(status)
                    });
            }


            function escAnnotator(url) {

                $interval.cancel(timer);
                $http({ method: 'POST', url: 'api/escAnnot', params: { "url": url } })
                    .success(function(data, status) {
                        $scope.annMode = data.result;
                        $scope.buttonText = "Annotator";
                        $scope.buttonTextS = "A";
                    })
                    .error(function(data) {
                        console.log(status)
                    });
            };


            //----------Funzioni per modificare i colori -----
            function RGBA(red, green, blue, alpha) {
                this.red = red;
                this.green = green;
                this.blue = blue;
                this.alpha = alpha;
                this.getCSS = function() {
                    return "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha + ")";
                }
            }

            var bgColor = new RGBA(255, 255, 0, 0.3);

            function setBgColour(elem, red, green, blue, opac) {
                bgColor.alpha = opac;
                bgColor.red = red;
                bgColor.green = green;
                bgColor.blue = blue;
                elem.style.backgroundColor = bgColor.getCSS();
            }

            $scope.statusColor = function(status) {
                if (status === "REJECTED") return { "color": "#F44336" };
                else {
                    if (status === "ACCEPTED") return { "color": "#4CAF50" };
                    else return { "color": "#FFC107" };
                }
            };

            function resetColour(id) {
                document.getElementById(id).removeAttribute("style");
            }

            //Scrolla fino a id (con un offset dal top di 200px)
            function scroll(id) {
                var element = angular.element(document.getElementById(id));
                var container = angular.element(document.getElementById('container'));
                container.scrollTo(element, 200, 1000);
            }

        }
    ]);
