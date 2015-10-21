angular.module('utils',[])
	.factory('ErrorUtils',function(){
		
		var errorObj = {
						'1000':'Email already exists',
						'1002':'User not found',
						'1003':'Invalid credentials',
						'1004':'Internal server error',
						'1005':'Invalid business object type',
						'1006':'Missing annotation',
						'1007':'Invalid request',
						'1008':'Metadatas and values length not equal.',
						'1009':'Business object not found',
						'1010':'Invalid path key. File upload failed',
						'1015':'Username already exists.'
					};
		
		var service = {
				getMessageByMetadata:function(meta){
					try{
						//If code is not found return detail message.
						if(errorObj[meta.code] == undefined)
							return meta.details;
						else if(meta.code == 1004)
							return meta.details;
						else
							return errorObj[meta.code];
					}
					catch(err){
						return err.message;
					}
				}
				
		};
		
		return service;
	})
	.factory('ServiceUtils',function(){
		
		var service = {
				sortArrayByField : function(items, field, reverse) {
				    var filtered = [];
				    angular.forEach(items, function(item) {
				      filtered.push(item);
				    });
				    filtered.sort(function (a, b) {
				      return (a[field] > b[field] ? 1 : -1);
				    });
				    
				    if(reverse) 
				    	filtered.reverse();
				    return filtered;
				},
				toggleLoading : function(overlayParam,loadingParam){
					if(overlayParam){
						overlayParam = false;
						loadingParam = false;
					}
					else{
						overlayParam = true;
						loadingParam = true;
					}
				}
		};
		
		return service;
	})
	;