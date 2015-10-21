function AdminController($scope,$state,context){
	
	if(context.getUser() == null)
	{
		$state.go('login');
	}
	else{
		$scope.profileObject = context.getUser();
		$scope.companyType  = 'Macys';
		$scope.navsection 	= 1;
		
		//Add page-signin class in body tag
		angular.element('#id-body').removeClass('page-signin');
		angular.element('#id-body').removeClass('skin-blue');
		angular.element('#id-body').addClass('skin-black');
	}	
}


angular.module('admin',[])
	.controller('AdminController',['$scope','$state','context',AdminController]);
	