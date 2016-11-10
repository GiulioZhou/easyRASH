angular.module('myApp').service("usrSrv",function($http){
	// --------- usr identification -------------
	this.getUsr = function(){
		$http.get("wsgi/api/getUser").success(function(data,status,headers,config){
			return data;

		});
	};
});
