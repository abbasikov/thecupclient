angular.module('context.service',[])
	.factory('context',function(){
		
		var Context = (function(){
			
			var instance = null;
			
			function init(){
				var _user		= null;
				
				return {
					setUser	: function(model){
						_user = model;
					},
					getUser	: function(){
						return _user;
					},
					clearContext : function(){
						this.setUser(null);
					}
				};
			}
			
			return {
				getInstance: function(){
					if(!instance){
						instance = init();
					}
					
					return instance;
				}
			};
		})();
		
		
		var service = {
				
				clearContext : function(){
					Context.getInstance().clearContext();
					return Context.getInstance();
				},
				getUser	: function(){
					return Context.getInstance().getUser();
				},
				setUser	: function(model){
					Context.getInstance().setUser(model);
				},
				isReady		: function(){
					return (this.getUser() != null);
				}
				
		};
		
		return service;
	})
	.factory('loadContext',['context','$state',function(context,$state){
		var service = {
			loadContext : function(){
				if(context.isReady()){
					if(window.console){
						console.log("Context is ready!!!");
					}
					return context;	
				}
				else{
					if(window.console){
						console.log("Context is not ready. Getting user from session storage");
					}
					
					if(sessionStorage.getItem("user") != null){
						try{
							context.setUser($.parseJSON(sessionStorage.getItem("user")));
						}
						catch(err){
							console.log(err.message);
							return null;
						}
					}
					else{
						if(window.console)
							console.log("User not found in session storage. Login again.");
					}
					return null;
				}
			},
			redirectToHomePage : function(){
				if(context.isReady()){
					
					//Start Module
					$state.go("home");
					
				}
				else{
					console.log("Unable to redirect. Context not found.");
				}
			}
		};
		return service;
	}]);