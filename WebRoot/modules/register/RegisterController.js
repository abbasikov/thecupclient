function RegisterController($scope,$state,Notification,FileUploader,ErrorUtils,CONSTANTS,context,$cookies,loadContext,RegisterService){
	Notification.success({message: 'Please fill the form for new registration.', title: 'Welcome to FillTheCup'});
	
	$scope.registerText = "SIGN UP";
	$scope.firstName 	= "";
	$scope.lastName		= "";
	$scope.userEmail	= "";
	$scope.labName		= "";
	$scope.managerName	= "";
	$scope.pdmName		= "";
	$scope.userName		= "";
	$scope.password		= "";
	$scope.confirmPassword = "";
	$scope.showLoading = false;
	    
	//Add page-signup class in body tag 
	angular.element('#id-body').removeClass('page-signin');
	angular.element('#id-body').addClass('page-signup');

	$scope.submitLab = function(){
		if($scope.password != $scope.confirmPassword){
			Notification.error({message:"Password and Confirm Password should be equal.", title: 'Error'});
			return;
		}
		
		if($scope.showLoading == true){
			Notification.success({message:"Signin in progress. Please wait...", title: 'Info'});
		}
		
		var data = 	"firstName="+$scope.firstName+"&"+
					"lastName="+$scope.lastName+"&"+
					"userEmail="+$scope.userEmail+"&"+
					"labName="+$scope.labName+"&" +
					"managerName="+$scope.managerName+"&"+
					"pdmName="+$scope.pdmName+"&"+
					"userName="+$scope.userName+"&"+
					"password="+$scope.password+"&"+
					"isSuperAdmin=false&isLabManager=true&isLabUser=false";

		var register = RegisterService.save(data);
		$scope.toggleRecordCreation();
		register.$promise.then(
			function(data){
				$scope.toggleRecordCreation();
				if(data.meta.code == 200){
					Notification.success({message:"Registered successfully.", title: 'Success'});
					context.setUser(data.data);
					
					//Store user in session storage
					sessionStorage.setItem('user',JSON.stringify(context.getUser()) );
					
					$scope.profileObject = context.getUser();
					
					//Redirect to admin module if the user is FTC_ADMIN
					if($scope.profileObject.username == 'ftcadmin'){
						$state.go('admin.labs');
					}
					else{
						//If no labs assigned. dont redirect to home page
						if($scope.profileObject.labs.length > 0)
							loadContext.redirectToHomePage();
						else
							Notification.error({message:"No labs assigned. Please check with admin.", title: 'UnAuthorized'});
					}	
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
	
	$scope.toggleRecordCreation = function(){
		if($scope.showLoading){
			$scope.showLoading = false;
			$scope.registerText = "SIGN UP";
		}
		else{
			$scope.showLoading = true;
			$scope.registerText = "Signing Up. Please wait...";
		}
	}
}
angular.module('register',['ngAnimate','ui.router','ui-notification','angularFileUpload'])
	.controller('RegisterController',['$scope','$state','Notification','FileUploader','ErrorUtils','CONSTANTS','context','$cookies','loadContext','RegisterService',RegisterController]);