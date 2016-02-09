function LabUsersController($scope,$modalInstance,labItem){
	$scope.labItem = labItem;
	$scope.ok = function(){
		$modalInstance.dismiss('cancel');
	};
	
}

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

function LabsController($scope,$state,Notification,context,ErrorUtils,ServiceUtils,RegisterService,DeleteService,$modal,UpdateObjectService,SysComponentService,DeleteSysComponentService,LabService,UsersService,GetAllLabsByUser,AssignLabToUser,PasswordResetService,ComponentsService,DeleteBusinessObject, $filter ){
	
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
	
	$scope.profileObject = context.getUser();
	$scope.labsList = [];
	$scope.usersList = [];
	$scope.globalSystemComponents = [];
	$scope.globalComponents = [];
	$scope.csvDataArray=  [];
	$scope.filename = "TheCup-LabsList";
	
	$scope.settingsLabs = {
			displayProp: 'name', 
			idProp: 'uuid',
			scrollable :true,
			scrollableHeight : 180
	}
	
	$scope.submitLab = function(){
		
		var data = 	"labName="+encodeURIComponent($scope.labname)+"&" +
					"managerName="+encodeURIComponent($scope.managername)+"&"+
					"pdmName="+encodeURIComponent($scope.pdmname)+"&"+
					"createdBy="+($scope.profileObject.username == 'ftcadmin' ? "Super Admin":($scope.profileObject.firstName+" "+$scope.profileObject.lastName));
		
		$scope.toggleRecordCreation();
		var register = LabService.save(data);
		
		register.$promise.then(
				function(data){
					$scope.toggleRecordCreation();
					if(data.meta.code == 200){
						Notification.success({message:"Record created successfully.", title: 'Success'});
						$scope.labsList.push(data.data);
						$scope.labsList = ServiceUtils.sortArrayByField($scope.labsList,'name',false); 
						
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
						$scope.generateCsvData();
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
	
	$scope.deleteBusinessObject = function(uuid,list,toggleFlag){
		var res = confirm("Are you sure you want to delete ? ");
		if (res == true) {
			var labs = DeleteService.save("uuid="+uuid);
			$scope.toggleListShow(toggleFlag);
			labs.$promise.then(
					function(data){
						$scope.toggleListShow(toggleFlag);
						if(data.meta.code == 200){
							$scope.deleteItemList(uuid,list);
							$scope.getAllLabs();
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
	
	
	$scope.editLab = function(uuid){
		
		$scope.selectedLabItem = $filter('filter')($scope.labsList, { uuid: uuid }, true)[0];
		
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
	
	$scope.editUser = function(uuid){
		
		$scope.selectedUserItem = $filter('filter')($scope.usersList, { uuid: uuid }, true)[0];
		
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
	
	$scope.resetPassword = function(uuid){
		var user = $filter('filter')($scope.usersList, { uuid: uuid }, true)[0];
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
					$scope.getAllLabs();
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
		
		if(selectedLabItem.name != updatedObj.labName){
			names += "name"+";";
			values += encodeURIComponent(updatedObj.labName)+";";
			update = true;
		}
		
		if(selectedLabItem.managerName != updatedObj.managerName){
			names += "managerName"+";";
			values += encodeURIComponent(updatedObj.managerName)+";";
			update = true;
		}
		
		if(selectedLabItem.pdmName != updatedObj.pdmName){
			names += "pdmName"+";";
			values += encodeURIComponent(updatedObj.pdmName)+";";
			update = true;
		}
		
		if(update){
			var data = "uuid="+selectedLabItem.uuid+"&"+names+"&"+values+"&delimiter=;";
			var update = UpdateObjectService.save(data);
			$scope.toggleListShow();
			update.$promise.then(
					function(data){
						$scope.toggleListShow();
						if(data.meta.code == 200){
							$scope.selectedLabItem.name				= updatedObj.labName;
							$scope.selectedLabItem.managerName 		= updatedObj.managerName;
							$scope.selectedLabItem.pdmName		 	= updatedObj.pdmName;
							$scope.generateCsvData();
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
	
	
	$scope.deleteItemList = function(uuid,list){
		var from 	= ServiceUtils.getIndexByUuid(list, uuid);
		var to		= 0;
		var rest = list.slice((to || from) + 1 || list.length);
		list.length = from < 0 ? list.length + from : from;
		list.push.apply(list, rest);
	};
	
	$scope.submitUser = function(){
		var data = 	"firstName="+encodeURIComponent($scope.firstName)+"&"+
		 			"lastName="+encodeURIComponent($scope.lastName)+"&"+
		 			"userEmail="+encodeURIComponent($scope.userEmail)+"&"+
		 			"userName="+encodeURIComponent($scope.userName)+"&"+
		 			"password="+encodeURIComponent($scope.password)+"&"+
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
						Notification.success({message:"User Created", title: 'Success'});
						$scope.usersList.push(data.data);
						$scope.getAllLabs();
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
	
	$scope.deleteItemFromGlobalComponentList = function(index){
		var from 	= index;
		var to		= 0;
		var rest = $scope.globalComponents.slice((to || from) + 1 || $scope.globalComponents.length);
		$scope.globalComponents.length = from < 0 ? $scope.globalComponents.length + from : from;
		$scope.globalComponents.push.apply($scope.globalComponents, rest);
	};
	
	$scope.generateCsvData = function(){
		$scope.csvDataArray = [];
		$scope.csvDataArray.push({});
		for(index in $scope.labsList){
			var labObject = {
								labName		: $scope.labsList[index].name,
								managerName	: $scope.labsList[index].managerName,
								pdmName		: $scope.labsList[index].pdmName,
								isActivated : $scope.labsList[index].isActivated == 'true' ? 'Yes' : 'No',
								createdBy 	: $scope.labsList[index].createdBy,
								createdOn	: $filter('date')( $scope.labsList[index].createdOnISO8601),
								userCount	: $scope.labsList[index].users.length
							};
			$scope.csvDataArray.push(labObject);
		}
	}
	
	$scope.getAllLabs = function(){
		var labs = LabService.get();
		$scope.toggleListShow('lab');
		labs.$promise.then(
				function(data){
					$scope.toggleListShow('lab');
					if(data.meta.code == 200){
						$scope.labsList = ServiceUtils.sortArrayByField(data.dataList,'name',false);
						$scope.generateCsvData()
					}
					else{
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
				},
				function(error){
					$scope.toggleListShow('lab');
					Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
				});
	};
	
	$scope.getAllUsers = function(){
		var get = UsersService.get();
		$scope.toggleListShow('user');
		get.$promise.then(
				function(data){
					$scope.toggleListShow('user');
					if(data.meta.code == 200){
						$scope.usersList = ServiceUtils.sortArrayByField(data.dataList,'firstName',false);						
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
	
	$scope.addComponent = function(){
		if($scope.componentName){
			var labs = SysComponentService.save("name="+$scope.componentName);
			$scope.toggleComponentShow();
			labs.$promise.then(
					function(data){
						$scope.toggleComponentShow();
						if(data.meta.code == 200){
							$scope.globalSystemComponents.push(data.data);
							$scope.globalSystemComponents = ServiceUtils.sortArrayByField($scope.globalSystemComponents,'name',false);
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
	
	$scope.addGlobalComponent = function(){
		if($scope.globalComponentName){
			var labs = ComponentsService.save("name="+$scope.globalComponentName);
			$scope.toggleComponentShow();
			labs.$promise.then(
					function(data){
						$scope.toggleComponentShow();
						if(data.meta.code == 200){
							$scope.globalComponents.push(data.data);
							$scope.globalComponentName = "";
							$scope.globalComponents = ServiceUtils.sortArrayByField($scope.globalComponents,'name',false);
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
	
	$scope.removeGlobalComponent = function(index){
		var labs = DeleteBusinessObject.save("uuid="+$scope.globalComponents[index].uuid);
		$scope.toggleComponentShow();
		labs.$promise.then(
				function(data){
					$scope.toggleComponentShow();
					if(data.meta.code == 200){
						$scope.deleteItemFromGlobalComponentList(index);
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
						$scope.globalSystemComponents = ServiceUtils.sortArrayByField(data.dataList,'name',false);						
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
	
	$scope.getAllGlobalComponents = function(){
		var labs = ComponentsService.get();
		$scope.toggleComponentShow();
		labs.$promise.then(
				function(data){
					$scope.toggleComponentShow();
					if(data.meta.code == 200){
						$scope.globalComponents = ServiceUtils.sortArrayByField(data.dataList,'name',false);
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
	
	$scope.showUsersByLab = function(index){
		
		$scope.selectedLabItem = $scope.labsList[index];
		
		var modalInstanceForLab = $modal.open({
		      templateUrl	: 'modules/admin/labs/labsUsers.tpl.html',
		      controller	: LabUsersController,
		      scope			: $scope,
		      resolve		: {
		          labItem: function () {
		            return $scope.selectedLabItem;
		          }
		        }});
	
	}
	
	$scope.getHeaderForCSV = function () {
		return ["Lab Name", "Manager Name", "PDM Name","Activated","CreatedBy", "CreatedOn", "Users Count"]
	};
	
	$scope.getAllLabs();
	$scope.getAllUsers();
	$scope.getAllSysComponents();
	$scope.getAllGlobalComponents();
}


angular.module('labs',['ngAnimate','ui.router','ui-notification','angularFileUpload','ng.httpLoader','angularFileUpload','ngSanitize', 'ngCsv'])
	.controller('LabsController',['$scope','$state','Notification','context','ErrorUtils','ServiceUtils','RegisterService','DeleteService','$modal','UpdateObjectService','SysComponentService','DeleteSysComponentService','LabService','UsersService','GetAllLabsByUser','AssignLabToUser','PasswordResetService','ComponentsService','DeleteBusinessObject ','$filter',LabsController])
	