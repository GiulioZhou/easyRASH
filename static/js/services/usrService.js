var app = angular.module('myApp').service('usrService', function($http) {
	
	var _usr={};
	
	this.setUsr= function (ute) {
		_usr=ute;
	};
	
	this.getUsr= function(){
		return _usr;
	};   	
   		
})