function TeamMembersController($scope,$state,Notification,loadContext,ErrorUtils,context,$timeout,ReleasesService,ReleasesCupService,DeleteBusinessObject,SysComponentService,UsersService,GetAllUsersByLab){
	$scope.$parent.navsection = -2;
	$scope.tmOverlay 	= false;
	$scope.tmLoading	= false;
	$scope.tableListOverlay = false;
	$scope.tableListLoading = false;
	$scope.usersList	= [];
	$scope.createdBy	= $scope.profileObject.firstName+" "+$scope.profileObject.lastName;
	
	$scope.firstName 	= "";
	$scope.lastName  	= "";
	$scope.userEmail	= "";	
	$scope.userName		= "";
	$scope.password		= "";
	
	
	$scope.toggleRecordCreation = function(){
		if($scope.tmOverlay){
			$scope.tmOverlay 	= false;
			$scope.tmLoading	= false;
		}
		else{
			$scope.tmOverlay 	= true;
			$scope.tmLoading	= true;
		}
	}
	
	$scope.toggleListLoading = function(){
		if($scope.tableListOverlay){
			$scope.tableListOverlay = false;
			$scope.tableListLoading = false;
		}
		else{
			$scope.tableListOverlay = true;
			$scope.tableListLoading = true;
		}
		
	}
	
	$scope.deleteUser = function(uuid,index){
		var rel = DeleteBusinessObject.save("uuid="+uuid);
		$scope.toggleListLoading();
		rel.$promise.then(
				function(data){
					$scope.toggleListLoading();
					if(data.meta.code == 200){
						$scope.deleteItemFromLabsList(index,$scope.usersList);
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleListLoading();
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
			});
	}
	
	$scope.deleteItemFromLabsList = function(index,list){
		var from 	= index;
		var to		= 0;
		var rest = list.slice((to || from) + 1 || list.length);
		list.length = from < 0 ? list.length + from : from;
		list.push.apply(list, rest);
	};
	
	$scope.createTeamMember = function(){
		var data = 	"firstName="+$scope.firstName+"&" +
					"lastName="+$scope.lastName+"&"+
					"userEmail="+$scope.userEmail+"&"+
					"userName="+$scope.userName+"&"+
					"password="+$scope.password+"&"+
					"labUuids="+$scope.$parent.selectedLab.uuid+"&"+
					"isSuperAdmin=false&isLabManager=false&isLabUser=true&isPasswordReset=true&createdBy="+$scope.createdBy;
		
		$scope.toggleRecordCreation();
		var register = UsersService.save(data);
		
		register.$promise.then(
			function(data){
				$scope.toggleRecordCreation();
				if(data.meta.code == 200){
					Notification.success({message:"Record created successfully.", title: 'Success'});
					$scope.usersList.push(data.data);
				}
				else{
					Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
				}
			},
			function(error){
				$scope.toggleRecordCreation();
				Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
			});
	}
	
	$scope.getAllUsers = function(){
		if($scope.$parent.selectedLab.uuid != undefined){
			var get = GetAllUsersByLab.get({id:$scope.$parent.selectedLab.uuid});
			$scope.toggleListLoading();
			get.$promise.then(
				function(data){
					$scope.toggleListLoading();
					if(data.meta.code == 200){
						$scope.usersList = data.dataList;
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleListLoading();
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
		}
	}
	
	$scope.getAllUsers();
	
}

angular.module('teammemebers',['ngAnimate','ui.router','ui-notification'])
	.controller('TeamMembersController',['$scope','$state','Notification','loadContext','ErrorUtils','context','$timeout','ReleasesService','ReleasesCupService','DeleteBusinessObject','SysComponentService','UsersService','GetAllUsersByLab',TeamMembersController]);