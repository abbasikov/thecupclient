function config($stateProvider, $urlRouterProvider,$httpProvider){
	
	$stateProvider
		.state("login",{
			url			:"/login",
			templateUrl	:"modules/login/Login.tpl.html",
			controller	: LoginController
		})
		.state("signout",{
			url			:"/login",
			templateUrl	:"modules/login/Login.tpl.html",
			controller	: LoginController
		})
		.state("register",{
			url			:"/register",
			templateUrl	:"modules/register/Register.tpl.html",
			controller	: RegisterController
		})
		.state("passwordreset",{
			url			:"/passwordreset",
			templateUrl	:"modules/passwordreset/PasswordReset.tpl.html",
			controller	: PasswordResetController
		})
		.state("passwordchange",{
			url			:"/passwordchange",
			templateUrl	:"modules/passwordchange/PasswordChange.tpl.html",
			controller	: PasswordChangeController
		})
		.state("admin",{
			url			:"/admin",
			templateUrl	:"modules/admin/Admin.tpl.html",
			controller	: AdminController
		})
		.state("admin.labs",{
			url			:"/labs",
			templateUrl	:"modules/admin/labs/Labs.tpl.html",
			controller	: LabsController
		})
		.state("admin.releases",{
			url			:"/releases",
			templateUrl	:"modules/admin/releases/Releases.tpl.html",
			controller	: ReleasesController
		})
		.state("admin.reports",{
			url			:"/reports",
			templateUrl	:"modules/admin/reports/Reports.tpl.html",
			controller	: ReportsController
		})
		.state("home",{
			url			:"/home",
			templateUrl	:"modules/home/Home.tpl.html",
			controller	: HomeController
		})
		.state("home.teammembers",{
			url			:"/teammembers",
			templateUrl	:"modules/home/teammembers/TeamMembers.tpl.html",
			controller	: TeamMembersController
		})
		.state("home.releasecups",{
			url			:"/releasecups",
			templateUrl	:"modules/home/releasecups/ReleaseCups.tpl.html",
			controller	: ReleaseCupsController
		})
		.state("home.releasecupdetail",{
			url			:"/releasecupdetail/:id",
			templateUrl	:"modules/home/releasecupdetails/ReleaseCupDetail.tpl.html",
			controller	: ReleaseCupDetailController
		})
		.state("mobilenotsuported",{
			url			:"/mobilenotsupported",
			templateUrl	:"templates/not_suported.tpl.html"
		});
	
		//Registering interceptor for showing loading on each ajax request
		$httpProvider.interceptors.push('myHttpInterceptor');
	
}

angular.module('fillTheCupApp',['ngImgCrop','angucomplete','ui.router', 'ngAnimate','ngResource','context.service','login','rest.service','utils','ngCookies','xeditable','ui.bootstrap','ngTagsInput','angularjs-dropdown-multiselect','ngTouch','ui.grid','ui.grid.edit','ui.grid.selection','ui.grid.grouping','angular.morris-chart','ui.tree','agGrid','xeditable','ftc.filters'])
	.config(config)
	.factory('myHttpInterceptor', function($q) {
	    return {
	      // optional method
	      'request': function(config) {
	        // do something on success
	    	$("#spinner").show();
	    	return config;
	      },
	
	      // optional method
	     'requestError': function(rejection) {
	        // do something on error
	    	 $("#spinner").hide();
	     },
	
	
	
	      // optional method
	      'response': function(response) {
	        // do something on success
	    	  $("#spinner").hide();
	    	  
	        return response;
	      },
	
	      // optional method
	     'responseError': function(rejection) {
	        // do something on error
	    	 $("#spinner").hide();
	    	 
	      }
	    };
	})
	.run(['$state','loadContext','$cookies',function($state,loadContext,$cookies){
			var model = loadContext.loadContext();
			
			if(model == undefined){
				//re-route to login
				$state.go("login");
			}
			else{
				//re-route to home
				$state.go("home.releasecups");
			}
	}]);