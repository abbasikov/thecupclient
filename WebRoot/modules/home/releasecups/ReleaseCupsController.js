function ReleaseCupsController($scope,$state,Notification,loadContext,ErrorUtils,context,$timeout,ReleasesService,ReleasesCupService,DeleteBusinessObject,SysComponentService,ComponentsByLabService,UpdateObjectService,DeleteRelationshipService,ServiceUtils){
	
	$scope.labUuid = $scope.profileObject.labs[0].uuid;
	$scope.availableDevDays = "";
	$scope.devDays			= "";
	$scope.regDays			= "";
	
	$scope.showReleaseCupsOverlay 	= false;
	$scope.showReleaseCupsLoading 	= false;
	
	$scope.tableListOverlay			 = false;		  
	$scope.tableListLoading			 = false;
	
	$scope.compLoading				= false;
	$scope.compOverlay				= false;
	
	$scope.releases				  = [];
	$scope.labComponents		  = [];
	$scope.release				  = "";
	$scope.errorMessage			  = "";
	
	$scope.$parent.navsection = -1;
	
	$scope.globalSysComponents 	= [];
	
	
	$scope.submitReleaseCup = function(){
		
		if($scope.validate() == false){
			Notification.error({message:$scope.errorMessage, title: 'Error'});
			return;
		}
		
		
		var data=	"releaseUuid="+$scope.release.uuid+"&" +
					"labUuid="+$scope.profileObject.labs[0].uuid+"&" +
					"availableDevDays="+$scope.availableDevDays+"&" +
					"devDays="+$scope.devDays+"&" +
					"regressionDays="+$scope.regDays+"&"+
					"sysComponents="+$scope.getSelectedSysComponentsUuids()+"&"+
					"createdBy="+$scope.profileObject.firstName+" "+$scope.profileObject.lastName;
		console.log("data : ",data);
		var rel = ReleasesCupService.save(data);
		$scope.toggleLoadingRecordCreation();
		rel.$promise.then(
				function(data){
					$scope.toggleLoadingRecordCreation();
					if(data.meta.code == 200){
						$scope.$parent.releaseCupsList.push(data.data);
						Notification.success({message:"ReleaseCup created. Please check left navigation section.", title: 'Error'});
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleLoadingRecordCreation();
					Notification.error({message: "Some error occurred1. Please try again later.", title: 'Error'});
			});
	};
	
	$scope.getSelectedSysComponentsUuids = function(){
		var list = "";
		for(index in $scope.globalSysComponents){
			if($scope.globalSysComponents[index].checked){
				list +=  $scope.globalSysComponents[index].uuid+";";
			}
		}
		
		return list;
	};
	
	$scope.validate = function(){
		try{
			var total 	= parseInt($scope.availableDevDays);
			var dev		= parseInt($scope.devDays);
			var reg		= parseInt($scope.regDays);
			
			if(total != (dev+reg)){
				$scope.errorMessage = "Available Dev Days must be equal to Dev and Regression Days."
				return false;
			}
			var systemComponentFound = false;
			for(index in $scope.globalSysComponents){
				if($scope.globalSysComponents[index].checked){
					systemComponentFound = true;
					break;
				}
			}
			
			if(systemComponentFound==false){
				$scope.errorMessage = "Please selected atleast one System Component."
				return false;
			}
			
			for(i in $scope.profileObject.labs[0].releaseCups){
				if($scope.profileObject.labs[0].releaseCups[i].release.uuid == $scope.release.uuid){
					$scope.errorMessage = "Release "+$scope.release.name+" already exists";
					return false;
				}
			}
			
			
		}
		catch(err){
			$scope.errorMessage = err.message;
			return false;
		}
		
		return true;
	};
	
	$scope.toggleLoadingRecordCreation = function(){
		if($scope.showReleaseCupsOverlay){
			$scope.showReleaseCupsOverlay = false;
			$scope.showReleaseCupsLoading = false;
		}
		else{
			$scope.showReleaseCupsOverlay = true;
			$scope.showReleaseCupsLoading = true;
		}
	};
	
	$scope.toggleCompCreationCreation = function(){
		if($scope.compLoading){
			$scope.compLoading				= false;
			$scope.compOverlay				= false;
		}
		else{
			$scope.compLoading				= true;
			$scope.compOverlay				= true;
		}
		
	};
	
	$scope.toggleTableListLoading = function(){
		if($scope.tableListOverlay){
			$scope.tableListOverlay			 = false;		  
			$scope.tableListLoading			 = false;
		}
		else{
			$scope.tableListOverlay			 = true;		  
			$scope.tableListLoading			 = true;
		}
	}
	
	$scope.changeRelease = function(){
		$scope.branchCutDate = $scope.release.branchCutDate;
		$scope.hardLockDate  = $scope.release.branchHardLockDate;
	}
	
	$scope.getAllReleasesList = function(){
		var rel = ReleasesService.get();
		rel.$promise.then(
				function(data){
					if(data.meta.code == 200){
						$scope.releases = data.dataList;
						$scope.releases.unshift({name:'Select Release',uuid:'0'});
						$scope.release = $scope.releases[0];
						
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					Notification.error({message: "Some error occurred1. Please try again later.", title: 'Error'});
			});
	};
	
	
	$scope.getAllSystemComponents =function(){
		var rel = SysComponentService.get();
		
		rel.$promise.then(
				function(data){
					if(data.meta.code == 200){
						for(index in data.dataList){
							var obj = data.dataList[index];
							$scope.globalSysComponents.push(obj);
						}
						
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
			});
	};
	
	$scope.deleteReleaseCup = function(uuid,index){
		
		var rel = DeleteBusinessObject.save("uuid="+uuid);
		$scope.toggleTableListLoading();
		rel.$promise.then(
				function(data){
					$scope.toggleTableListLoading();
					if(data.meta.code == 200){
						$scope.$parent.deleteReleaseCupFromList(index);
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleTableListLoading();
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
			});
	};
	
	$scope.deleteItemFromList = function(index,list){
		var from 	= index;
		var to		= 0;
		var rest = list.slice((to || from) + 1 || list.length);
		list.length = from < 0 ? list.length + from : from;
		list.push.apply(list, rest);
	};
	
	$scope.checkChanged = function(item){
		var names 	= "names=isChecked";
		var values 	= "values="+(item.isCheckedBoolean ? 'true' : 'false');
		var data = "uuid="+item.uuid+"&"+names+"&"+values+"&delimiter=,";
		var update = UpdateObjectService.save(data);
		update.$promise.then(
				function(data){
					if(data.meta.code == 200){
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
		
	}
	
	$scope.removeGlobalComponent = function(uuid,index){
		//call delete relationship service here.
		var data = "pUuid="+$scope.labUuid+"&cUuid="+uuid+"&relationshipType=LAB_COMPONENT"
		var rel = DeleteRelationshipService.save(data);
		$scope.toggleCompCreationCreation();
		rel.$promise.then(
				function(data){
					$scope.toggleCompCreationCreation();
					if(data.meta.code == 200){
						$scope.deleteItemFromList(index,$scope.labComponents);
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleCompCreationCreation();
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
			});
	};
	
	$scope.addComponent = function(){
		if($scope.componentName){
			var data = "name="+$scope.componentName+"&createdBy="+$scope.profileObject.firstName+" "+$scope.profileObject.lastName;
			var rel = ComponentsByLabService.save({id:$scope.labUuid},data);
			$scope.toggleCompCreationCreation();
			rel.$promise.then(
					function(data){
						$scope.toggleCompCreationCreation();
						if(data.meta.code == 200){
							data.data.isCheckedBoolean = data.data.isChecked == 'true' ? true : false;
							$scope.labComponents.push(data.data);
							$scope.componentName = "";
						}
						else{
							Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
						}
					},
					function(error){
						$scope.toggleCompCreationCreation();
						Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
		}
	}
	
	$scope.getAllLabComponents = function(){
		var rel = ComponentsByLabService.get({id:$scope.labUuid});
		$scope.toggleCompCreationCreation();
		rel.$promise.then(
				function(data){
					$scope.toggleCompCreationCreation();
					if(data.meta.code == 200){
						$scope.labComponents = data.dataList;
						for(index in $scope.labComponents){
							$scope.labComponents[index].isCheckedBoolean = $scope.labComponents[index].isChecked == 'true' ? true : false;
						}
						$scope.labComponents = ServiceUtils.sortArrayByField($scope.labComponents, "createdBy", true); 
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleCompCreationCreation();
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
			});
	}
	
	$scope.getAllReleasesList();
	$scope.getAllSystemComponents();
	$scope.getAllLabComponents();
		
}


angular.module('releasecups',['ngAnimate','ui.router','ui-notification'])
	.controller('ReleaseCupsController',['$scope','$state','Notification','loadContext','ErrorUtils','context','$timeout','ReleasesService','ReleasesCupService','DeleteBusinessObject','SysComponentService','ComponentsByLabService','UpdateObjectService','DeleteRelationshipService','ServiceUtils',ReleaseCupsController]);