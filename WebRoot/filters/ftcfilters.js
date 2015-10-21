angular.module('ftc.filters',[])
	.filter('formatmvplink',function(){
		return function(input){
			try{
				if(input == undefined || input == '' || input.indexOf(";") == -1)
					return input;
				
				return input.substring(input.indexOf(";")+1, input.length );
			}
			catch(err){
				console.log("Error occurred in formatmvplink filter. Error: "+err.message);
				return input;
			}
		};
	})
	.filter('formatmvptitle',function(){
		return function(input){
			try{
				if(input == undefined || input == '' || input.indexOf(";") == -1)
					return input;
				
				return input.substring(0, input.indexOf(";"));
			}
			catch(err){
				console.log("Error occurred in formatmvptitle filter. Error: "+err.message);
				return input;
			}
		};
	});