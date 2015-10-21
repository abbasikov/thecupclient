function LabUpdateController($scope,$modalInstance,labItem){
	
	$scope.isError = false;
	$scope.errorMsg = "";
	
	$scope.updatedObj = {
			labName		: '',
			managerName	: '',
			pdmName		: '',
			userName	: '',
			isSuperAdmin: ''
	};
	
	$scope.updatedObj.labName		= labItem.name;
	$scope.updatedObj.managerName	= labItem.managerName;
	$scope.updatedObj.pdmName		= labItem.pdmName;
	//$scope.updatedObj.userName		= labItem.users[0].username;
	//$scope.updatedObj.isSuperAdmin	= (labItem.users[0].isSuperAdmin == "true") ? true : false;
	
	
	$scope.update = function(){
		$modalInstance.close($scope.updatedObj);
	};
	
	$scope.cancel = function(){
		$modalInstance.dismiss('cancel');
	};
	
}

function UserUpdateController($scope,$modalInstance,userItem,labsList,GetAllLabsByUser){
	
	$scope.isError = false;
	$scope.errorMsg = "";
	
	$scope.updatedObj = {
			firstName	: '',
			lastName	: '',
			userEmail	: '',
			userName	: '',
			password	: '',
			userName	: '',
			isLabManager: '',
			isSuperAdmin: '',
			labsList	:[],
			selectedLabs:[]
	};
	
	
	$scope.updatedObj.firstName		= userItem.firstName;
	$scope.updatedObj.lastName		= userItem.lastName;
	$scope.updatedObj.userEmail		= userItem.userEmail;
	$scope.updatedObj.userName		= userItem.username;
	$scope.updatedObj.isSuperAdmin	= (userItem.isSuperAdmin == "true") ? true : false;
	$scope.updatedObj.isLabManager	= (userItem.isLabManager == "true") ? true : false;
	
	$scope.getAssignedLabsToUser = function(){
		var rel = GetAllLabsByUser.get({id:userItem.uuid});
		rel.$promise.then(
				function(data){
					if(data.meta.code == 200){
						console.log(data.dataList);
						for(index in data.dataList){
							$scope.updatedObj.selectedLabs.push({
								label	: 	data.dataList[index].name,
								id		:	data.dataList[index].uuid
							});
						}
					}
					else{
						console.log("Error: "+data.meta.details);
					}
				},
				function(error){
					console.log("Error: ",error);
		});
	}
	
	$scope.update = function(){
		$modalInstance.close($scope.updatedObj);
	};
	
	$scope.cancel = function(){
		$modalInstance.dismiss('cancel');
	};
	
	$scope.getAssignedLabsToUser();
	
	for(i in labsList){
		if(labsList[i].isActivated == 'true'){
			$scope.updatedObj.labsList.push({
				label	: 	labsList[i].name,
				id		:	labsList[i].uuid
			});
		}
		
	}
}

function LabsController($scope,$state,Notification,context,ErrorUtils,ServiceUtils,RegisterService,DeleteService,$modal,UpdateObjectService,SysComponentService,DeleteSysComponentService,LabService,UsersService,GetAllLabsByUser,AssignLabToUser,PasswordResetService){
	
	$scope.rcOverlay = false;
	$scope.rcLoading = false;
	
	$scope.listOverlay = false;
	$scope.listLoading = false;
	
	$scope.usrOverlay	= false;
	$scope.usrLoading	= false;
	
	$scope.listOverlayForUser = false;
	$scope.listLoadingForUser = false;
	
	$scope.componentOverlay = false;
	$scope.componentLoading = false;
	
	$scope.makeSuperAdmin = false;
	$scope.$parent.navsection 	= 1;
	
	$scope.labsList = [];
	$scope.usersList = [];
	$scope.globalSystemComponents = [];
	
	$scope.settingsLabs = {
			displayProp: 'name', idProp: 'uuid'
	}
	
	$scope.submitLab = function(){
		var data = 	"labName="+$scope.labname+"&" +
					"managerName="+$scope.managername+"&"+
					"pdmName="+$scope.pdmname+"&"+
					"createdBy=Super Admin";
		
		$scope.toggleRecordCreation();
		var register = LabService.save(data);
		
		register.$promise.then(
				function(data){
					$scope.toggleRecordCreation();
					if(data.meta.code == 200){
						Notification.success({message:"Record created successfully.", title: 'Success'});
						$scope.labsList.push(data.data);
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleRecordCreation();
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
	};
	
	$scope.selectedLabs = []; 
	
	$scope.toggleRecordCreation = function(){
		if($scope.rcOverlay){
			$scope.rcOverlay = false;
			$scope.rcLoading = false;
		}
		else{
			$scope.rcOverlay = true;
			$scope.rcLoading = true;
		}
	};
	
	$scope.toggleUserCreation = function(){
		if($scope.usrOverlay){
			$scope.usrOverlay	= false;
			$scope.usrLoading	= false;
		}
		else{
			$scope.usrOverlay	= true;
			$scope.usrLoading	= true;
		}
		
	};
	
	$scope.toggleListShow = function(flag){
		if(flag=="lab")
		{
			if($scope.listOverlay){
				$scope.listOverlay = false;
				$scope.listLoading = false;
			}
			else{
				$scope.listOverlay = true;
				$scope.listLoading = true;
			}
		}
		if(flag == 'user'){
			if($scope.listOverlayForUser){
				$scope.listOverlayForUser = false;
				$scope.listLoadingForUser = false;
			}
			else{
				$scope.listOverlayForUser = true;
				$scope.listLoadingForUser = true;
			}
		}
		
	}
	
	$scope.toggleComponentShow = function(){
		if($scope.componentOverlay){
			$scope.componentOverlay = false;
			$scope.componentLoading = false;
		}
		else{
			$scope.componentOverlay = true;
			$scope.componentLoading = true;
		}
	};
	
	$scope.activateLab = function(lab,flag){
		var names 	= "names=isActivated";
		var values 	= "values="+flag;
		var data = "uuid="+lab.uuid+"&"+names+"&"+values+"&delimiter=,";
		var update = UpdateObjectService.save(data);
		$scope.toggleListShow('lab');
		update.$promise.then(
				function(data){
					$scope.toggleListShow('lab');
					if(data.meta.code == 200){
						lab.isActivated = flag;
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleListShow('lab');
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
		
	}
	
	$scope.deleteBusinessObject = function(uuid,index,list,toggleFlag){
		var res = confirm("Are you sure you want to delete ? ");
		if (res == true) {
			var labs = DeleteService.save("uuid="+uuid);
			$scope.toggleListShow(toggleFlag);
			labs.$promise.then(
					function(data){
						$scope.toggleListShow(toggleFlag);
						if(data.meta.code == 200){
							$scope.deleteItemList(index,list);
						}
						else{
							Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
						}
						
					},
					function(error){
						$scope.toggleListShow(toggleFlag);
						Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
					});
		   
		} 
		
	};
	
	
	$scope.editLab = function(index){
		
		$scope.selectedLabItem = $scope.labsList[index];
		
		var modalInstanceForLab = $modal.open({
		      templateUrl	: 'modules/admin/labs/updateLab.tpl.html',
		      controller	: LabUpdateController,
		      scope			: $scope,
		      resolve		: {
		          labItem: function () {
		            return $scope.selectedLabItem;
		          }
		        }
		});
		
		modalInstanceForLab.result.then(function (updatedObj) {
			 $scope.updateLab($scope.selectedLabItem, updatedObj);
			 	 
		    }, function () {
		      
		    });
		 
	};
	
	$scope.editUser = function(index){
		
		$scope.selectedUserItem = $scope.usersList[index];
		
		var modalInstanceUser = $modal.open({
		      templateUrl	: 'modules/admin/labs/updateUser.tpl.html',
		      controller	: UserUpdateController,
		      scope			: $scope,
		      resolve		: {
		          userItem: function () {
		            return $scope.selectedUserItem;
		          },
		          labsList : function(){
		        	  return $scope.labsList;
		          },
		          GetAllLabsByUser : function(){
		        	  return GetAllLabsByUser;
		          }
		        }
		    });
		
		modalInstanceUser.result.then(function (updatedObj) {
			 $scope.updateUser($scope.selectedUserItem, updatedObj);
		}, function () {});		 
	};
	
	$scope.updateUser = function(selectedUserItem,updatedObj){
		var names 	= "names=";
		var values 	= "values=";
		var update	= false;
		
		if(selectedUserItem.firstName	!= updatedObj.firstName){
			names += "firstName"+",";
			values += encodeURIComponent(updatedObj.firstName)+",";
			update = true;
		}
		
		if(selectedUserItem.lastName	!= updatedObj.lastName){
			names += "lastName"+",";
			values += encodeURIComponent(updatedObj.lastName)+",";
			update = true;
		}
		
		if(selectedUserItem.username	!= updatedObj.userName){
			names += "userName"+",";
			values += encodeURIComponent(updatedObj.userName)+",";
			update = true;
		}
		
		if(selectedUserItem.userEmail	!= updatedObj.userEmail){
			names += "userEmail"+",";
			values += encodeURIComponent(updatedObj.userEmail)+",";
			update = true;
		}
		
		if(selectedUserItem.isSuperAdmin	!= (updatedObj.isSuperAdmin+"")){
			names += "isSuperAdmin"+",";
			values += (updatedObj.isSuperAdmin+"")+",";
			update = true;
		}
		
		if(selectedUserItem.isLabManager	!= (updatedObj.isLabManager+"")){
			names += "isLabManager"+",";
			values += (updatedObj.isLabManager+"")+",";
			update = true;
		}
		
		if(update){
			var data = "uuid="+selectedUserItem.uuid+"&"+names+"&"+values+"&delimiter=,";
			var update = UpdateObjectService.save(data);
			$scope.toggleListShow('user');
			update.$promise.then(
					function(data){
						$scope.toggleListShow('user');
						if(data.meta.code == 200){
							selectedUserItem.username 		= updatedObj.userName;
							selectedUserItem.isSuperAdmin 	= (updatedObj.isSuperAdmin+"");
							selectedUserItem.isLabManager 	= (updatedObj.isLabManager+"");
							selectedUserItem.firstName 		= updatedObj.firstName;
							selectedUserItem.lastName 		= updatedObj.lastName;
							selectedUserItem.userEmail 		= updatedObj.userEmail;
							
						}
						else{
							Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
						}
					},
					function(error){
						$scope.toggleListShow('user');
						Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
					});
			
		}
		
		$scope.updateLabAssignmentOfUser(updatedObj.selectedLabs,selectedUserItem.uuid);
	};
	
	$scope.resetPassword = function(index){
		var user = $scope.usersList[index];
		var res = confirm("Are you sure you want to reset password ? ");
		if (res == true) {
		var save = PasswordResetService.save("username="+user.username);
		save.$promise.then(
					function(data){
						if(data.meta.code == 200){
							Notification.success({message:"Password has been reset. New password is temp123", title: 'Success',delay:6000});
						}
						else{
							Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
						}
					},
					function(error){
						Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
					});
		}
	}
	
	$scope.updateLabAssignmentOfUser = function(updatedSelectedLabs,userUuid){
		var updatedPipeSeperateLabs = $scope.getFormattedSelectedLabs(updatedSelectedLabs);
		console.log("Updated Labs: "+updatedPipeSeperateLabs);
		var data = "userUuid="+userUuid+"&labUuids="+updatedPipeSeperateLabs+"&createdBy=Super Admin";
		var assign = AssignLabToUser.save(data);
		$scope.toggleListShow('user');
		assign.$promise.then(
				function(data){
					$scope.toggleListShow('user');
					console.log("Updated Lab Response : ",data);
				},
				function(error){
					$scope.toggleListShow('user');
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
	};
	
	
	$scope.updateLab = function(selectedLabItem,updatedObj){
		var names 	= "names=";
		var values 	= "values=";
		var update  = false;
		
		if(selectedLabItem.managerName != updatedObj.managerName){
			names += "managerName"+",";
			values += encodeURIComponent(updatedObj.managerName)+",";
			update = true;
		}
		
		if(selectedLabItem.pdmName != updatedObj.pdmName){
			names += "pdmName"+",";
			values += encodeURIComponent(updatedObj.pdmName)+",";
			update = true;
		}
		
		if(update){
			var data = "uuid="+selectedLabItem.uuid+"&"+names+"&"+values+"&delimeter=,";
			var update = UpdateObjectService.save(data);
			$scope.toggleListShow();
			update.$promise.then(
					function(data){
						$scope.toggleListShow();
						if(data.meta.code == 200){
							$scope.selectedLabItem.managerName 		= updatedObj.managerName;
							$scope.selectedLabItem.pdmName		 	= updatedObj.pdmName;
						}
						else{
							Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
						}
					},
					function(error){
						$scope.toggleListShow();
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
	
	$scope.submitUser = function(){
		var data = 	"firstName="+$scope.firstName+"&"+
		 			"lastName="+$scope.lastName+"&"+
		 			"userEmail="+$scope.userEmail+"&"+
		 			"userName="+$scope.userName+"&"+
		 			"password="+$scope.password+"&"+
					"isSuperAdmin="+$scope.makeSuperAdmin+"&"+
					"isLabManager="+$scope.makeLabManager+"&"+
					"isLabUser=true&"+
					"isPasswordReset=true&"+
					"createdBy=Super Admin&"+
					"labUuids="+$scope.getFormattedSelectedLabs($scope.selectedLabs);
		var save = UsersService.save(data);
		$scope.toggleUserCreation();
		save.$promise.then(
				function(data){
					$scope.toggleUserCreation();
					if(data.meta.code == 200){
						Notification.success({message:"Record Created", title: 'Success'});
						$scope.usersList.push(data.data);
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleUserCreation();
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
	};
	
	$scope.getFormattedSelectedLabs = function(list){
		if(list.length <1 ){
			return "";
		}
		var labsList = "";
		for(index in list){
			labsList += list[index].id +";";
		}
		
		return labsList;
	}
	
	$scope.deleteItemFromComponentList = function(index){
		var from 	= index;
		var to		= 0;
		var rest = $scope.globalSystemComponents.slice((to || from) + 1 || $scope.globalSystemComponents.length);
		$scope.globalSystemComponents.length = from < 0 ? $scope.globalSystemComponents.length + from : from;
		$scope.globalSystemComponents.push.apply($scope.globalSystemComponents, rest);
	};
	
	$scope.getAllLabs = function(){
		var labs = LabService.get();
		
		labs.$promise.then(
				function(data){
					if(data.meta.code == 200){
						console.log("AllLabs : ",data)
						$scope.labsList = data.dataList;
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
	};
	
	$scope.getAllUsers = function(){
		var get = UsersService.get();
		
		get.$promise.then(
				function(data){
					if(data.meta.code == 200){
						console.log("AllUsers : ",data)
						$scope.usersList = data.dataList;
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
	}
	
	$scope.addComponent = function(){
		if($scope.componentName){
			var labs = SysComponentService.save("name="+$scope.componentName);
			$scope.toggleComponentShow();
			labs.$promise.then(
					function(data){
						$scope.toggleComponentShow();
						if(data.meta.code == 200){
							$scope.globalSystemComponents.push(data.data);
							$scope.componentName = "";
						}
						else{
							Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
						}
					},
					function(error){
						$scope.toggleComponentShow();
						Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
					});
		} 
	};
	
	$scope.removeComponent = function(index){
		var labs = DeleteSysComponentService.save("uuid="+$scope.globalSystemComponents[index].uuid);
		$scope.toggleComponentShow();
		labs.$promise.then(
				function(data){
					$scope.toggleComponentShow();
					if(data.meta.code == 200){
						$scope.deleteItemFromComponentList(index);
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleComponentShow();
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
	};
	
	$scope.getAllSysComponents = function(){
		var labs = SysComponentService.get();
		$scope.toggleComponentShow();
		labs.$promise.then(
				function(data){
					$scope.toggleComponentShow();
					if(data.meta.code == 200){
						$scope.globalSystemComponents = data.dataList;
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleComponentShow();
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
	};
	
	$scope.getAllLabs();
	$scope.getAllUsers();
	$scope.getAllSysComponents();
}


angular.module('labs',['ngAnimate','ui.router','ui-notification','angularFileUpload','ng.httpLoader','angularFileUpload'])
	.controller('LabsController',['$scope','$state','Notification','context','ErrorUtils','ServiceUtils','RegisterService','DeleteService','$modal','UpdateObjectService','SysComponentService','DeleteSysComponentService','LabService','UsersService','GetAllLabsByUser','AssignLabToUser','PasswordResetService',LabsController])
	