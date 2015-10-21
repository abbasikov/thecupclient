function ReleasesUpdateController($scope,$modalInstance,releaseItem){
	
	$scope.updatedObject = {
			name 				: releaseItem.name,
			branchCutDate		: releaseItem.branchCutDate,
			branchFreezeDate	: releaseItem.branchFreezeDate,
			branchHardLockDate 	: releaseItem.branchHardLockDate,
			branchProductionDate: releaseItem.branchProductionDate,
			mcomDate			: releaseItem.mcomDate,
			bcomDate			: releaseItem.bcomDate
	};
	
	
	$scope.update = function(){
		$modalInstance.close($scope.updatedObject);
	};
	
	$scope.cancel = function(){
		$modalInstance.dismiss('cancel');
	};
	
	
}

function ReleasesController($scope,$state,Notification,context,ErrorUtils,DeleteService,$modal,UpdateObjectService,ReleasesService){
	$scope.name					= "";
	$scope.branchCutDate  		= "";
	$scope.branchFreezeDate		= "";
	$scope.branchHardLockDate	= "";
	$scope.branchProductionDate = "";
	$scope.mcomDate				= "";
	$scope.bcomDate				= "";
	
	$scope.listOverlay	= false;
	$scope.listLoading 	= false;
	$scope.releaseOverlay = false;
	$scope.releaseLoading = false;
	
	$scope.$parent.navsection 	= 2;
	
	$scope.releasesList = [];
	
	$scope.toggleLoading = function(flag){
		if(flag == 'list'){
			if($scope.listOverlay){
				$scope.listOverlay	= false;
				$scope.listLoading 	= false;
			}
			else{
				$scope.listOverlay	= true;
				$scope.listLoading 	= true;
			}
			
		}
		if(flag='record'){
			if($scope.releaseOverlay){
				$scope.releaseOverlay = false;
				$scope.releaseLoading = false;				
			}
			else{
				$scope.releaseOverlay = true;
				$scope.releaseLoading = true;				
			}
		}
	}
	
	$scope.editRelease = function(index){
		$scope.selectedReleaseItem = $scope.releasesList[index];
		
		var modalInstance = $modal.open({
		      templateUrl	: 'modules/admin/releases/updateRelease.tpl.html',
		      controller	: ReleasesUpdateController,
		      scope			: $scope,
		      resolve		: {
		          releaseItem: function () {
		            return $scope.selectedReleaseItem;
		          }
		        }
		    });
		
		modalInstance.result.then(function (updatedObj) {
			var names 	= "names=";
			var values 	= "values=";
			var update	= false;
			
			if($scope.selectedReleaseItem.name	!= updatedObj.name){
				names += "name"+",";
				values += encodeURIComponent(updatedObj.name)+",";
				update = true;
			}
			
			if($scope.selectedReleaseItem.branchCutDate	!= updatedObj.branchCutDate){
				names += "branchCutDate"+",";
				values += encodeURIComponent(updatedObj.branchCutDate)+",";
				update = true;
			}
			
			if($scope.selectedReleaseItem.branchFreezeDate	!= updatedObj.branchFreezeDate){
				names += "branchFreezeDate"+",";
				values += encodeURIComponent(updatedObj.branchFreezeDate)+",";
				update = true;
			}
			
			if($scope.selectedReleaseItem.branchHardLockDate	!= updatedObj.branchHardLockDate){
				names += "branchHardLockDate"+",";
				values += encodeURIComponent(updatedObj.branchHardLockDate)+",";
				update = true;
			}
			
			if($scope.selectedReleaseItem.branchProductionDate	!= updatedObj.branchProductionDate){
				names += "branchProductionDate"+",";
				values += updatedObj.branchProductionDate+",";
				update = true;
			}
			
			if($scope.selectedReleaseItem.mcomDate	!= updatedObj.mcomDate){
				names += "mcomDate"+",";
				values += (updatedObj.mcomDate+"")+",";
				update = true;
			}
			
			if($scope.selectedReleaseItem.bcomDate	!= updatedObj.bcomDate){
				names += "bcomDate"+",";
				values += (updatedObj.bcomDate+"")+",";
				update = true;
			}
			
			if(update){
				var data = "uuid="+$scope.selectedReleaseItem.uuid+"&"+names+"&"+values+"&delimiter=,";
				var update = UpdateObjectService.save(data);
				$scope.toggleLoading('list');
				update.$promise.then(
						function(data){
							$scope.toggleLoading('list');
							if(data.meta.code == 200){
								$scope.selectedReleaseItem.name 				= updatedObj.name;
								$scope.selectedReleaseItem.branchCutDate 		= updatedObj.branchCutDate;
								$scope.selectedReleaseItem.branchFreezeDate 	= updatedObj.branchFreezeDate;
								$scope.selectedReleaseItem.branchHardLockDate 	= updatedObj.branchHardLockDate;
								$scope.selectedReleaseItem.branchProductionDate = updatedObj.branchProductionDate;
								$scope.selectedReleaseItem.mcomDate 			= updatedObj.mcomDate;
								$scope.selectedReleaseItem.bcomDate 			= updatedObj.bcomDate;
								
							}
							else{
								Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
							}
						},
						function(error){
							$scope.toggleLoading('list');
							Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
						});
				
			}
		}, function () {});
	}
	
	$scope.deleteBusinessObject = function(uuid,index,list,toggleFlag){
		var res = confirm("Are you sure you want to delete ? ");
		if (res == true) {
			var labs = DeleteService.save("uuid="+uuid);
			$scope.toggleLoading(toggleFlag);
			labs.$promise.then(
					function(data){
						$scope.toggleLoading(toggleFlag);
						if(data.meta.code == 200){
							$scope.deleteItemList(index,list);
						}
						else{
							Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
						}
						
					},
					function(error){
						$scope.toggleLoading(toggleFlag);
						Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
					});
		   
		} 
		
	};
	
	$scope.deleteItemList = function(index,list){
		var from 	= index;
		var to		= 0;
		var rest = list.slice((to || from) + 1 || list.length);
		list.length = from < 0 ? list.length + from : from;
		list.push.apply(list, rest);
	};
	
	$scope.submitRelease = function(){
		var data = 	"name="+$scope.name+"&"+
					"branchCutDate="+$scope.branchCutDate+"&"+
					"branchFreezeDate="+$scope.branchFreezeDate+"&"+
					"branchHardLockDate="+$scope.branchHardLockDate+"&"+
					"branchProductionDate="+$scope.branchProductionDate+"&"+
					"mcomDate="+$scope.mcomDate+"&"+
					"bcomDate="+$scope.bcomDate+"&"+
					"isActivated=true";
		var save = ReleasesService.save(data);
		$scope.toggleLoading('record');
		save.$promise.then(
				function(data){
					$scope.toggleLoading('record');
					if(data.meta.code == 200){
						$scope.releasesList.push(data.data);
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleLoading('record');
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
	};
	
	$scope.activateRelease = function(release,index,flag){
		var names 	= "names=isActivated";
		var values 	= "values="+flag;
		var data = "uuid="+release.uuid+"&"+names+"&"+values+"&delimiter=,";
		var update = UpdateObjectService.save(data);
		$scope.toggleLoading('list');
		update.$promise.then(
				function(data){
					$scope.toggleLoading('list');
					if(data.meta.code == 200){
						release.isActivated = flag;
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleLoading('list');
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
	}
	
	$scope.getAllReleases = function(){
		var get = ReleasesService.get();
		$scope.toggleLoading('list');
		get.$promise.then(
				function(data){
					$scope.toggleLoading('list');
					if(data.meta.code == 200){
						$scope.releasesList = data.dataList;
						console.log("ReleaseList : ",$scope.releasesList);
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleLoading('list');
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
	};
	
	$scope.getAllReleases();
}


angular.module('releases',['ngAnimate','ui.router','ui-notification','angularFileUpload','ng.httpLoader','angularFileUpload'])
	.controller('ReleasesController',['$scope','$state','Notification','context','ErrorUtils','DeleteService','$modal','UpdateObjectService','ReleasesService',ReleasesController])
	