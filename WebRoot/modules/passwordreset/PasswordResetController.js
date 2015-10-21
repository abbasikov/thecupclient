function PasswordResetController($scope,$state,$timeout,$location,Notification,FileUploader,PasswordResetService,ErrorUtils,CONSTANTS,context,$cookies,loadContext){
	Notification.success({message: 'Please enter email.', title: 'Reset Password'});
	
	//Add page-signup class in body tag 
	angular.element('#id-body').addClass('page-signin');
	angular.element('#id-body').addClass('page-signup');
	
	$scope.SubmitText = "SUBMIT";
	$scope.showLoading  = false;
	$scope.errorMessage = "";
	$scope.userEmail = "";
	
	$scope.Submit = function(){
			
			$scope.toggleLoading();
			
			var data = "email="+$scope.userEmail;
			
			var passwordReset = PasswordResetService.save(data);
			
			passwordReset.$promise.then(
					function(data){
						$scope.toggleLoading();
						if(data.meta.code == 200){
							
							Notification.success({message: 'Please check your email.', title: 'Success'});
							  
							//Redirecting to login page after 2 seconds interval.
							$timeout(function(){ $state.go('login'); },2000); // Redirecting to Login
						}
						else{
							Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
						}
					},
					function(error){
						$scope.toggleLoading();
						Notification.error({message: "Some error occurred. Please try again later.", title: 'Error'});
					});
	};
	
	$scope.toggleLoading = function(){
		if($scope.SubmitText == "SUBMIT"){
			$scope.SubmitText = "Searching email address. Please wait..";
			$scope.showLoading = true;
		}
		else{
			$scope.SubmitText = "SUBMIT";
			$scope.showLoading = false;
		}
	};
	
	$scope.Cancel = function(){
		$state.go('login');
	};
	
	
	
		
}
angular.module('passwordreset',['ngAnimate','ui.router','ui-notification','angularFileUpload'])
	.controller('PasswordResetController',['$scope','$state','$timeout','$location','Notification','FileUploader','PasswordResetService','ErrorUtils','CONSTANTS','context','$cookies','loadContext',PasswordResetController]);