function HomeController($scope,$state,Notification,context,ReleasesCupService,ReleasesCupByLabService,ServiceUtils,GetAllLabsByUser,UpdateObjectService){
	
	$scope.releaseCupsList		= [];
	$scope.getAllReleaseCupList = function(){
		var rel = ReleasesCupByLabService.get({id:$scope.profileObject.labs[0].uuid});
		rel.$promise.then(
				function(data){
					if(data.meta.code == 200){
						$scope.releaseCupsList = data.dataList;
						$scope.redirectToLastReleaseCup();
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					Notification.error({message: "Some error occurred1. Please try again later.", title: 'Error'});
			});
	};
	
	$scope.redirectToLastReleaseCup = function(){
		try{
			if($scope.releaseCupsList == undefined || $scope.releaseCupsList.length < 1){
				$state.go("home.releasecups");
			}
			else{
				var sortedReleaseCups = ServiceUtils.sortArrayByField($scope.releaseCupsList,"lastClicked",true);
				$state.go("home.releasecupdetail",{id:sortedReleaseCups[0].uuid});
			}
			
		}
		catch(err){
			console.log("Error In redirectToLastReleaseCup: Erorr: "+err.message);
			$state.go("home.releasecups");
		}
	};
		
	$scope.deleteReleaseCupFromList = function(index){
		var from 	= index;
		var to		= 0;
		var rest = $scope.releaseCupsList.slice((to || from) + 1 || $scope.releaseCupsList.length);
		$scope.releaseCupsList.length = from < 0 ? $scope.releaseCupsList.length + from : from;
		$scope.releaseCupsList.push.apply($scope.releaseCupsList, rest);
	};
	
	$scope.selectedLab 	= {};
	$scope.getAllLabsOfUser = function(){
		var userUuid = $scope.profileObject.uuid;
		var rel = GetAllLabsByUser.get({id:userUuid});
		rel.$promise.then(
				function(data){
					if(data.meta.code == 200){
						if(data.dataList.length < 1){
							$state.go('login');
						}
						else{
							var sortedLabs 				= ServiceUtils.sortArrayByField(data.dataList,"lastClicked",true);
							$scope.profileObject.labs 	= sortedLabs;
							$scope.selectedLab 			= $scope.profileObject.labs[0]; 
							$scope.getAllReleaseCupList();
						}						
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					Notification.error({message: "Some error occurred1. Please try again later.", title: 'Error'});
		});
	}
	
	$scope.updateLastClicked = function(){
		var currentDate = new Date();
		var names 	= "names=lastClicked";
		var values 	= "values="+currentDate.toISOString();
		var data = "uuid="+$scope.selectedLab.uuid+"&"+names+"&"+values+"&"+"delimiter=;;;";
		var update = UpdateObjectService.save(data);
		update.$promise.then(
				function(data){
					console.log("Response LastClick: ",data);
					location.reload();
				},
				function(error){
					console.log("Error: ",error);
				});
	};
	
	
	if(context.getUser() == null)
	{
		$state.go('login');
	}
	else{
		$scope.profileObject 	= context.getUser();
		console.log("Profile Object: ",$scope.profileObject);
		
		$scope.companyType  	= "Macys";
		$scope.isSuperAdmin		= ($scope.profileObject.isSuperAdmin == undefined || $scope.profileObject.isSuperAdmin == 'false') ? false:true;
		$scope.navsection 		= -1;
		
		//Add page-signin class in body tag
		angular.element('#id-body').removeClass('page-signin');
		$scope.getAllLabsOfUser();
	}	
	
	
	
}


angular.module('home',['ngAnimate','ui.router','ui-notification','angularFileUpload'])
	.controller('HomeController',['$scope','$state','Notification','context','ReleasesCupService','ReleasesCupByLabService','ServiceUtils','GetAllLabsByUser','UpdateObjectService',HomeController]);
	