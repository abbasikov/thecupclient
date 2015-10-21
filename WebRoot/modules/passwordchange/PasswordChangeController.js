function PasswordChangeController($scope,$state,$timeout,$location,PasswordChangeService,Notification,ErrorUtils,CONSTANTS,context,$cookies,loadContext){
	Notification.success({message: 'Please provide Email to recover Password.', title: 'Welcome to FillTheCup'});
	
	//Add page-signup class in body tag 
	angular.element('#id-body').addClass('page-signin');
	angular.element('#id-body').addClass('page-signup');
	
	$scope.SubmitText = "SUBMIT";
	$scope.showLoading  = false;
	$scope.errorMessage = "";
	
	$scope.newPassword = "";
	$scope.confirmNewPassword = "";
	
	$scope.Submit = function(){
		if($scope.validatePassword()){
			
			$scope.toggleLoading();
			
			$scope.profileObject = context.getUser();
			$scope.username = $scope.profileObject['username'];
			var data = "newpassword="+$scope.newPassword+"&username="+$scope.username;
			
			var passwordChange = PasswordChangeService.save(data);
			
			passwordChange.$promise.then(
					function(data){
						$scope.toggleLoading();
						if(data.meta.code == 200){
							
							//Clear old context
							context.clearContext();
							
							//Set new user data
							context.setUser(data.data);
							
							//Remove old user session
							sessionStorage.removeItem('user');
														
							//Store user in session storage
							sessionStorage.setItem('user',JSON.stringify(context.getUser) );
							
							//Redirect to appropriate home page.
							loadContext.redirectToHomePage();
							
						}
						else{
							Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
						}
					},
					function(error){
						$scope.toggleLoading();
						Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
					});
		}
		else
			Notification.error({message: $scope.errorMessage, title: 'Error'});
	}
	
	$scope.validatePassword = function(){
		if($scope.newPassword == undefined || $scope.newPassword == ''){
			$scope.errorMessage = "Please provide new Password.";
			return false;
		}
		
		if($scope.confirmNewPassword == undefined || $scope.confirmNewPassword == ''){
			$scope.errorMessage = "Please confirm new Password.";
			return false;
		}
		
		if($scope.newPassword != $scope.confirmNewPassword){
			$scope.errorMessage = "Password does not match.";
			return false;
		}
		
		return true;
	}
	
	$scope.toggleLoading = function(){
		if($scope.SubmitText == "SUBMIT"){
			$scope.SubmitText = "Saving new Password. Please wait..";
			$scope.showLoading = true;
		}
		else{
			$scope.SubmitText = "SUBMIT";
			$scope.showLoading = false;
		}
	}
	
	$scope.Cancel = function(){
		$state.go('login');
	}
		
}
angular.module('passwordchange',['ngAnimate','ui.router','ui-notification','angularFileUpload'])
	.controller('PasswordChangeController',['$scope','$state','$timeout','$location','PasswordChangeService','Notification','FileUploader','ErrorUtils','CONSTANTS','context','$cookies','loadContext',PasswordChangeController]);