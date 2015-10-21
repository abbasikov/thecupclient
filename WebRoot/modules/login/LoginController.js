function LoginController($scope,$state,Notification,FileUploader,LoginService,loadContext,ErrorUtils,context,$timeout){
	Notification.success({message: 'Please login to begin.', title: 'Welcome to FillTheCup'});
	
	$scope.loginText = "SIGN IN";
	$scope.showLoading = false;
	$scope.signInProcess = false;
	
	$scope.login = function(){
		
		if($scope.signInProcess){
			Notification.success({message:"Logging in. Please wait...", title: 'SignIn'});
			return;
		}
		
		if($scope.validate()){
			var data = "userName="+$scope.username+"&password="+$scope.password;
			$scope.toggleLoading();
			var login = LoginService.save(data);
			
			login.$promise.then(
					function(data){
						$scope.toggleLoading();
						if(data.meta.code == 200){
							
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
								{
									if($scope.profileObject.isPasswordReset == 'true')
										$state.go('passwordchange');
									else
										loadContext.redirectToHomePage();
								}
								else
									Notification.error({message:"Either No labs are assigned OR assigned labs are deactivated. Please check with Super Admin.", title: 'UnAuthorized'});
							}							
							
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
		
	};
	
	$scope.validate = function(){
		
		if($scope.loginForm.username.$error.required != undefined && $scope.loginForm.username.$error.required){
			Notification.error({message:'Username is required', title: 'Error'});
			return false;
		}
		/*
		if($scope.loginForm.email.$error.email != undefined && $scope.loginForm.email.$error.email){
			Notification.error({message:'Email is invalid', title: 'Error'});
			return false;
		}
		*/
		if($scope.password == undefined || $scope.password == ''){
			Notification.error({message:'Password is required', title: 'Error'});
			return false;
		}
		
		return true;
	};
	
	$scope.redirectToHomePage = function(){
		if(context !=null && context.isReady()){
			//Output details
			if(window.console)console.log("Employee:",context.getEmployee());
			
			if(context.getEmployee().company.companyType == "Supplier"){
				$state.go("supplier.machines");
			}
		}
	};
	
	$scope.toggleLoading = function(){
		if($scope.loginText == "SIGN IN"){
			$scope.signInProcess = true;
			$scope.loginText = "Signing in. Please wait..";
			$scope.showLoading = true;
		}
		else{
			$scope.loginText = "SIGN IN";
			$scope.signInProcess = false;
			$scope.showLoading = false;
		}
	};
	
	//Remove the employee from session storage and context.
	sessionStorage.removeItem("user");	
	context.clearContext();
	
	//Add page-signin class in body tag 
	angular.element('#id-body').addClass('page-signin');
	angular.element('#id-body').removeClass('page-signup');
	
	var isMobile = {
		    Android: function() {
		        return navigator.userAgent.match(/Android/i);
		    },
		    BlackBerry: function() {
		        return navigator.userAgent.match(/BlackBerry/i);
		    },
		    iOS: function() {
		        return navigator.userAgent.match(/iPhone|iPod/i);
		    },
		    Opera: function() {
		        return navigator.userAgent.match(/Opera Mini/i);
		    },
		    Windows: function() {
		        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
		    },
		    any: function() {
		        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		    }
		};
	
	if( isMobile.any() ) 
		$state.go('mobilenotsuported');
	else{
		$timeout(function() {
			$('#username_id').focus();
		}, 500);
	}
}


angular.module('login',['ngAnimate','ui.router','ui-notification','angularFileUpload'])
	.controller('LoginController',['$scope','$state','Notification','FileUploader','LoginService','loadContext','ErrorUtils','context','$timeout',LoginController]);