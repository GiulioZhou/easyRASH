//Roba che voleva fare sara ma non ci è riuscita -> Vedo se riesco ad aggiustare altrimenti da cestinare

var app = angular.module('myApp').service('usrService', function($http) {
	
	var _usr={};
	
	this.setUsr= function (ute) {
		_usr=ute;
	};
	
	this.getUsr= function(){
		return _usr;
	};   	
   		
})