function ReportsController($scope,$state,Notification,context,ErrorUtils,DeleteService,$modal,UpdateObjectService, ServiceUtils){
	$scope.$parent.navsection 	= 3;
}


angular.module('reports',['ngAnimate','ui.router','ui-notification'])
	.controller('ReportsController',['$scope','$state','Notification','context','ErrorUtils','DeleteService','$modal','UpdateObjectService','ServiceUtils',ReportsController])
	