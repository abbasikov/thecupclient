function HypothesisController($scope,$state,Notification,loadContext,ErrorUtils,context,$timeout){
	
	$scope.showHypothesisOverlay = false;
	$scope.showHypothesisLoading = false;
	
	
	
	$scope.toggleLoadingRecordCreation = function(){
		if($scope.showHypothesisOverlay){
			$scope.showHypothesisOverlay = false;
			$scope.showHypothesisLoading = false;
		}
		else{
			$scope.showHypothesisOverlay = true;
			$scope.showHypothesisLoading = true;
		}
	}
	
}


angular.module('hypothesis',['ngAnimate','ui.router','ui-notification'])
	.controller('HypothesisController',['$scope','$state','Notification','loadContext','ErrorUtils','context','$timeout',HypothesisController]);