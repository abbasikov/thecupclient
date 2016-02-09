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

function ReleasesController($scope,$state,Notification,context,ErrorUtils,DeleteService,$modal,UpdateObjectService,ReleasesService,ServiceUtils, $filter){
	$scope.name					= "";
	$scope.branchCutDate  		= "";
	$scope.branchFreezeDate		= "";
	$scope.branchHardLockDate	= "";
	$scope.branchProductionDate = "TBD";
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
	
	$scope.editRelease = function(uuid){
		$scope.selectedReleaseItem = $filter('filter')($scope.releasesList, { uuid: uuid }, true)[0];
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
	
	$scope.deleteBusinessObject = function(uuid,list,toggleFlag){
		var res = confirm("Are you sure you want to delete ? ");
		if (res == true) {
			var labs = DeleteService.save("uuid="+uuid);
			$scope.toggleLoading(toggleFlag);
			labs.$promise.then(
					function(data){
						$scope.toggleLoading(toggleFlag);
						if(data.meta.code == 200){
							$scope.deleteItemList(uuid,list);
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
	
	$scope.deleteItemList = function(uuid,list){		
		var from 	= ServiceUtils.getIndexByUuid(list, uuid);
		var to		= 0;
		var rest = list.slice((to || from) + 1 || list.length);
		list.length = from < 0 ? list.length + from : from;
		list.push.apply(list, rest);
	};
	
	$scope.submitRelease = function(){
		var data = 	"name="+encodeURIComponent( $scope.name )+"&"+
					"branchCutDate="+encodeURIComponent($scope.branchCutDate)+"&"+
					"branchFreezeDate="+encodeURIComponent($scope.branchFreezeDate)+"&"+
					"branchHardLockDate="+encodeURIComponent($scope.branchHardLockDate)+"&"+
					"branchProductionDate="+encodeURIComponent($scope.branchProductionDate)+"&"+
					"mcomDate="+encodeURIComponent($scope.mcomDate)+"&"+
					"bcomDate="+encodeURIComponent($scope.bcomDate)+"&"+
					"isActivated=true";
		var save = ReleasesService.save(data);
		$scope.toggleLoading('record');
		save.$promise.then(
				function(data){
					$scope.toggleLoading('record');
					if(data.meta.code == 200){
						$scope.releasesList.push(data.data);
						$scope.releasesList = ServiceUtils.sortArrayByField($scope.releasesList,'name',false);
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
						$scope.releasesList = ServiceUtils.sortArrayByField(data.dataList,'name',false);
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
	.controller('ReleasesController',['$scope','$state','Notification','context','ErrorUtils','DeleteService','$modal','UpdateObjectService','ReleasesService','ServiceUtils','$filter',ReleasesController])
	