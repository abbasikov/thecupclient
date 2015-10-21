function ReleaseCupDetailController($scope,$stateParams,$state,Notification,loadContext,ErrorUtils,context,$timeout,ReleasesService,UpdateObjectService,ReleasesCupService,uiGridConstants,$filter,IPMService,ServiceUtils,editableOptions){
	editableOptions.theme = 'bs3';
	
	$scope.mtOverlay 			= false;
	$scope.mtLoading 			= false;
	$scope.ocOverlay			= false;
	$scope.ocLoading			= false;
	$scope.rpOverlay			= false;
	$scope.rpLoading			= false;
	$scope.bgOverlay			= false;
	$scope.bgLoading			= false;
	
	$scope.releaseCupUuid		= $stateParams.id;
	$scope.selectedReleaseCup	= null;
	$scope.$parent.navsection	= $stateParams.id;
	$scope.gridApi				= null;
	$scope.showDeleteButton		= false;
	$scope.occupiedPercentageData = [];
	$scope.remainingPercentageData= [];
	$scope.twoGraphs = {
			occupiedPercentageData 	: [],
			remainingPercentageData : []
	};
	
	$scope.ipmView  	= false;
	$scope.detailView 	= true;
	
	$scope.ipmTree		= [];
	
	$scope.barGraphData 			= [];
	$scope.barGraphIPMData 			= [];
	
	$scope.ipmArray = [ 
	                    { id: 'IPM1', ipm: 'IPM1', isCollapsed:true },
	                    {  id: 'IPM2', ipm: 'IPM2', isCollapsed:true },
	                    { id: 'IPM3', ipm: 'IPM3', isCollapsed:true },
	                    { id: 'IPM4', ipm: 'IPM4', isCollapsed:true }];
	
	$scope.mostModelArray = [
						{ id: 'Minimize', mostmodelname: 'Minimize', isCollapsed:true },
						{ id: 'Optimize', mostmodelname: 'Optimize', isCollapsed:true },
						{ id: 'Scale', mostmodelname: 'Scale', isCollapsed:true },
						{ id: 'Test', mostmodelname: 'Test', isCollapsed:true }
	                         ];
	
	$scope.colorListOccupied   	= ["#3c8dbc", "#f56954", "#00a65a",'#8A2BE2',"#31C0BE","#c7254e",'#5F9EA0','#6495ED','#DC143C','#00008B',"#f56954", '#483D8B','#483D8B','#483D8B'];
	$scope.colorListRemaining   = ["#3c8dbc", "#f56954", "#00a65a",'#8A2BE2',"#31C0BE","#c7254e",'#5F9EA0','#6495ED','#DC143C','#00008B',"#f56954", '#483D8B','#483D8B','#483D8B'];
	
    
	$scope.gridOptions = {
			
			enableSorting  	: true,
			enableRowSelection: true,
			showGridFooter: true,
		    showColumnFooter: true,
			columnDefs 		: [],
			data			: []
	};
	$scope.resize = true;
	
	$scope.updateMatrix = function(){
		var names 	= "names=matrixJson";
		$scope.selectedReleaseCup.matrix.data = $scope.gridOptions.data;
		var values 	= "values="+encodeURIComponent(angular.toJson($scope.selectedReleaseCup.matrix))+";;;";
		var data = "uuid="+$scope.selectedReleaseCup.uuid+"&"+names+"&"+values+"&"+"delimiter=;;;";
		var update = UpdateObjectService.save(data);
		update.$promise.then(
				function(data){
					if(data.meta.code != 200){
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
					$scope.rePopulatebarGraphData();
					$scope.rePopulatebarGraphIPMData();
					console.log("Update Matrix Response: ",data);
				},
				function(error){
					console.log("Error: ",error);
				});
	};
	
	$scope.updateTree = function(){
		var names 	= "names=ipmTree";
		$scope.selectedReleaseCup.ipmTree = $scope.ipmTree;
		var values 	= "values="+encodeURIComponent( angular.toJson($scope.selectedReleaseCup.ipmTree));
		var data = "uuid="+$scope.selectedReleaseCup.uuid+"&"+names+"&"+values+"&"+"delimiter=;;;";
		var update = UpdateObjectService.save(data);
		update.$promise.then(
				function(data){
					if(data.meta.code != 200){
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
					console.log("Update Tree Response: ",data);
				},
				function(error){
					console.log("Error: ",error);
				});
	};
	
	$scope.$on('uiGridEventEndCellEdit', function (data) {
		$scope.updateMatrix();
		$scope.reCalculateIpmTree();
	});
	
	$scope.getReleaseCup = function(){
		var req = ReleasesCupService.get({id:$scope.releaseCupUuid});
		$scope.toggleMtLoading();
		req.$promise.then(
				function(data){
					$scope.toggleMtLoading();
					if(data.meta.code == 200){
						$scope.selectedReleaseCup = data.data;
						console.log("selectedReleaseCup : ",$scope.selectedReleaseCup);
						$scope.pushDataInGrid();
						
						setTimeout(function(){
							$('#idGraphBtn').click();
							$('#idGraphBtn2').click();
						},1000);
						$scope.updateLastClicked();
						
						$scope.ipmTree = JSON.parse($scope.selectedReleaseCup.ipmTree);
						$scope.reCalculateIpmTree();
						
					}
					else{
						$scope.toggleMtLoading();
						Notification.error({message:ErrorUtils.getMessageByMetadata(data.meta), title: 'Error'});
					}
					
				},
				function(error){
					console.log("Error: ",error);
				});
	};
	
	
	
	$scope.deleteRow = function(){
		if($scope.gridApi.selection.getSelectedRows().length > 0){
			for(index in $scope.gridApi.selection.getSelectedRows()){
				var indexToDel = $scope.gridOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[index]);
				$scope.deleteItemFromList(indexToDel);
			}
		}
		$scope.reCalculateIpmTree();
	};
	
	$scope.saveTree = function(rowform,taskObject){
		var colums = $scope.getColumsForTasksListInTree();
		for(index in colums){
			taskObject[colums[index].name] = rowform.$data["taskObj."+colums[index].name] 
		}
		
		$scope.reCalculateIpmTree();
	}
	
	$scope.deleteItemFromList = function(index){
		var from 	= index;
		var to		= 0;
		var rest = $scope.gridOptions.data.slice((to || from) + 1 || $scope.gridOptions.data.length);
		$scope.gridOptions.data.length = from < 0 ? $scope.gridOptions.data.length + from : from;
		$scope.gridOptions.data.push.apply($scope.gridOptions.data, rest);
		$scope.updateMatrix();
	};
	
	$scope.deleteMVPFromTreeList =  function(list,index){
		var from 	= index;
		var to		= 0;
		var rest = list.slice((to || from) + 1 || list.length);
		list.length = from < 0 ?list.length + from : from;
		list.push.apply(list, rest);
		
	}
	
	$scope.deleteTaskObjectFromList = function(list,index){
		var from 	= index;
		var to		= 0;
		var rest = list.slice((to || from) + 1 || list.length);
		list.length = from < 0 ?list.length + from : from;
		list.push.apply(list, rest);
		$scope.reCalculateIpmTree();
	}
	
	$scope.addRowInTaskList = function(ipmObject){
		var obj		= {};
		for(colIndex in ipmObject.columns){
			var colName = ipmObject.columns[colIndex].name;
			obj[colName] = ""
		}
		ipmObject.taskList.push(obj);
	}
	
	$scope.addRow = function(){
		var dataObj = { };
		for(i in $scope.selectedReleaseCup.matrix.columns){
			var columName = $scope.selectedReleaseCup.matrix.columns[i].name;
			var confLink  		= "";
			dataObj[columName] 	= "";
			dataObj[confLink]	= "";
		}
		$scope.gridOptions.data.push(dataObj);
		$scope.updateMatrix();
	};
	
	$scope.showIPMView = function(){
		$scope.ipmView 		= true;
		$scope.detailView 	= false;
	};
	
	$scope.showDetailView = function(){
		$scope.ipmView 		= false;
		$scope.detailView 	= true;
		//$state.go("home.releasecupdetail",{id:'RELCP-E93F2C65-0688'});
	};
	
	
	 $scope.gridOptions.onRegisterApi = function(gridApi){
		 
	      //set gridApi on scope
	      $scope.gridApi = gridApi;
	      gridApi.selection.on.rowSelectionChanged($scope,function(row){
	        $scope.showDeleteButton = row.isSelected;
	      });
	      
	      gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
	          console.log("afterCellEdit");  
	    	  $scope.$apply();
	      });
	 
//	      gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
//	        var msg = 'rows changed ' + rows.length;
//	        alert("row changed");
//	        $log.log(msg);
//	      });
	};
	
	$scope.reCalculateIpmTree = function(){
		
		$scope.ipmTree.ipms["IPM1"] = $scope.ipmTree.ipms["IPM1"] == null ? [] : $scope.ipmTree.ipms["IPM1"];
		$scope.ipmTree.ipms["IPM2"] = $scope.ipmTree.ipms["IPM2"] == null ? [] : $scope.ipmTree.ipms["IPM2"];
		$scope.ipmTree.ipms["IPM3"] = $scope.ipmTree.ipms["IPM3"] == null ? [] : $scope.ipmTree.ipms["IPM3"];
		$scope.ipmTree.ipms["IPM4"] = $scope.ipmTree.ipms["IPM4"] == null ? [] : $scope.ipmTree.ipms["IPM4"];

		//For Adding
		for(index in $scope.gridOptions.data){
			var matrixRow = $scope.gridOptions.data[index];
			if(matrixRow.IPM != undefined && matrixRow.IPM != ''){
				var ipmObject = { mvpName : '',isCollapsed:true,columns:null,taskList:[{}] };
				ipmObject.mvpName = matrixRow.MVPs;
				
				//Adding MOST variable
				ipmObject.mostModel = matrixRow.MOSTModel;
				
				//Adding colums
				ipmObject.columns = $scope.getColumsForTasksListInTree();
				
				//Now add default tasks
				ipmObject.taskList = $scope.getDefaultTasks(ipmObject.columns);
				
				//Before pushing in ipmTree check if the MVP already exists
				if($scope.mvpAlreadyExists(matrixRow.IPM,ipmObject.mvpName,ipmObject.mostModel) == false)
					$scope.ipmTree.ipms[matrixRow.IPM].push(ipmObject);
				else
					console.log("MVP:"+ipmObject.mvpName+", MostModel:"+ipmObject.mostModel+" Already Exists in IPM:"+matrixRow.IPM+". Not adding.");
			}
		}
		
		//For Deleting
		for(var index1 = 0;index1 < $scope.ipmArray.length ; index1++){
			var ipmName = $scope.ipmArray[index1];
			var mvpRowsInTree = $scope.ipmTree.ipms[ipmName.ipm];
			for(index2 in mvpRowsInTree){
				var mvpRowInTree =mvpRowsInTree[index2];
				if($scope.combinationExistsInMatrix(mvpRowInTree.mvpName,ipmName.ipm,mvpRowInTree.mostModel) == false){
					$scope.deleteMVPFromTreeList(mvpRowsInTree,index2);
				}
			}
		}
		
		console.log("ipmTree : ",$scope.ipmTree);
		console.log("updating tree");
		$scope.updateTree();
	}
	
	$scope.combinationExistsInMatrix = function(mvpName,ipmName,mostModel){
		for(index in $scope.gridOptions.data){
			var matrixRow = $scope.gridOptions.data[index];
			if(matrixRow.IPM == ipmName && matrixRow.MVPs == mvpName){
				return true;
			}
		}
		return false;
	}
	
	$scope.mvpAlreadyExists = function(ipm,mvp,mostModel){
		
		var particularIPMArray = $scope.ipmTree.ipms[ipm];
		for(var h = 0 ; h < particularIPMArray.length; h++){
			if(particularIPMArray[h].mvpName == mvp && particularIPMArray[h].mostModel == mostModel){
				return true;
			}
		}
		return false;
	}
	
	$scope.getColumsForTasksListInTree = function(){
		
		var columns = [];
		columns.push({displayName:'Tasks', name:'Tasks'});
		for(var i=2;i<$scope.selectedReleaseCup.matrix.columns.length;i++){
			columns.push({
				displayName	: $scope.selectedReleaseCup.matrix.columns[i].displayName, 
				name		: $scope.selectedReleaseCup.matrix.columns[i].name
				});
		}
		return columns;
	}
	
	$scope.getDefaultTasks = function(columsList){
		var arr = [];
		//Number of rows
		for(var rowIndex=0;rowIndex<3;rowIndex++){
			var obj		= {};
			for(colIndex in columsList){
				var colName = columsList[colIndex].name;
				
				if(colName == 'Tasks'){
					if(rowIndex == 0)
						obj[colName] = "Kill Switch";
					if(rowIndex == 1)
						obj[colName] = "Segmentation";
					if(rowIndex == 2)
						obj[colName] = "PRC";
				}
				else
					obj[colName] = "0";
			}
			arr.push(obj);
		}
		console.log("arr: ",arr);
		
		return arr;
	}
	
	$scope.openAddress = function(){
		alert("hello");
	}
	
	$scope.pushDataInGrid = function(){
		$scope.selectedReleaseCup.matrix = JSON.parse($scope.selectedReleaseCup.matrix);
		$scope.gridOptions.columnDefs  	= $scope.selectedReleaseCup.matrix.columns;
		$scope.gridOptions.data  		=  $scope.selectedReleaseCup.matrix.data;
		
		//Iterate thru each colum
		for(i in $scope.gridOptions.columnDefs){
			$scope.gridOptions.columnDefs[i].enableCellEdit = true;
			$scope.gridOptions.columnDefs[i].enableCellEdit = true;
			if($scope.gridOptions.columnDefs[i].name == "MVPs" ){
				$scope.gridOptions.columnDefs[i].type	 		= "text";
				$scope.gridOptions.columnDefs[i].cellTemplate	= 'mapAddress.html';
			}
			else if($scope.gridOptions.columnDefs[i].name == "MOSTModel" ){
				$scope.gridOptions.columnDefs[i].type	 				= "text";
				$scope.gridOptions.columnDefs[i].editableCellTemplate 	= 'ui-grid/dropdownEditor';
				//$scope.gridOptions.columnDefs[i].cellFilter 			= 'mapIPM';
				$scope.gridOptions.columnDefs[i].editDropdownValueLabel	= 'mostmodelname';
				$scope.gridOptions.columnDefs[i].editDropdownOptionsArray= $scope.mostModelArray;
			}
			else if($scope.gridOptions.columnDefs[i].name == "IPM"){
				$scope.gridOptions.columnDefs[i].type	 				= "text";
				$scope.gridOptions.columnDefs[i].editableCellTemplate 	= 'ui-grid/dropdownEditor';
				//$scope.gridOptions.columnDefs[i].cellFilter 			= 'mapIPM';
				$scope.gridOptions.columnDefs[i].editDropdownValueLabel	= 'ipm';
				$scope.gridOptions.columnDefs[i].editDropdownOptionsArray= $scope.ipmArray;
			}
			else{
				$scope.gridOptions.columnDefs[i].type	 		= "number";
				$scope.gridOptions.columnDefs[i].aggregationType = uiGridConstants.aggregationTypes.sum;
				$scope.gridOptions.columnDefs[i].footerCellTemplate = $scope.footerCellTempateFunc();
			}
				
			$scope.gridOptions.columnDefs[i].cellClass		= 'grid-text-align';
			$scope.gridOptions.columnDefs[i].headerCellClass		= 'grid-text-align grid-header';
		}//end-for-loop
		
		$scope.gridOptions.showGridFooter = false;
	};
	
	
	
	
	$scope.footerCellTempateFunc = function(){
		var template = '<div class="ui-grid-cell-contents" id="{{col.uid}}" col-index="renderIndex"><div">Total:&nbsp;{{col.getAggregationValue()}}</div></div>';
		return template;
	};
	
	$scope.toggleMtLoading = function(){
		if($scope.mtOverlay){
			$scope.mtOverlay = false;
			$scope.mtLoading = false;
		}
		else{
			$scope.mtOverlay = true;
			$scope.mtLoading = true;
		}
	};
	
	$scope.toggleOcLoading = function(){
		if($scope.ocOverlay){
			$scope.ocOverlay			= false;
			$scope.ocLoading			= false;	
		}
		else{
			$scope.ocOverlay			= true;
			$scope.ocLoading			= true;
		}	
	};
	
	$scope.toggleRpLoading = function(){
		if($scope.rpOverlay){
			$scope.rpOverlay			= false;
			$scope.rpLoading			= false;	
		}
		else{
			$scope.rpOverlay			= true;
			$scope.rpLoading			= true;
		}
		
	};
	
	$scope.toggleBgLoading = function(){
		if($scope.bgOverlay){
			$scope.bgOverlay			= false;
			$scope.bgLoading			= false;
		}
		else{
			$scope.bgOverlay			= true;
			$scope.bgLoading			= true;
		}		
	};
	
	$scope.graphFormatter = function(input){
		try{
			var number  =$filter('number')( input, 2) + "";
			var dotIndex = number.indexOf(".");
			if(dotIndex>0){
				if(number.charAt(dotIndex+1) == '0' && number.charAt(dotIndex+2) == '0')
					return Math.round(number)+"%";
			}
			return number+"%";
		}
		catch(err){
			return input+"%";
		}
		
	};
	
	$scope.graphFormatter = function(input,suffix){
		try{
			var number  =$filter('number')( input, 2) + "";
			var dotIndex = number.indexOf(".");
			if(dotIndex>0){
				if(number.charAt(dotIndex+1) == '0' && number.charAt(dotIndex+2) == '0')
					return Math.round(number)+suffix;
			}
			return number+suffix;
		}
		catch(err){
			return input+suffix;
		}
		
	};
	
	$scope.rePopulateDonutGraphData = function(){
		
		$scope.twoGraphs.occupiedPercentageData = [];
		$scope.twoGraphs.remainingPercentageData=[];
		
		//For Occupied
		for(var i=2;i<$scope.gridOptions.columnDefs.length;i++){
			var occObj = {label:'', value:''};
			var remObj = {label:'', value:''};
			
			occObj.label = $scope.gridOptions.columnDefs[i].name;
			remObj.label = $scope.gridOptions.columnDefs[i].name;
			
			var devDays = parseInt($scope.selectedReleaseCup.devDays);
			var gridApiColIndex= -1;
			
			//Find aggregation value of colum  occObj.label
			for(j in $scope.gridApi.grid.columns){
				if($scope.gridApi.grid.columns[j].name == occObj.label){
					gridApiColIndex = j;
					break;					
				}
			}
			
			//Calculating Percentage
			var aggregateValue 		= $scope.gridApi.grid.columns[gridApiColIndex].getAggregationValue();
			var percentValOcc		= (aggregateValue/devDays)*100;
			var percentValRem		= ((devDays-aggregateValue)/devDays)*100;
			
			occObj.value = percentValOcc;
			remObj.value = percentValRem;
			
			console.log("OP "+occObj.label+" :  aggregateValue: "+aggregateValue+", devDays:"+devDays+", Percent:"+occObj.value);
			$scope.twoGraphs.occupiedPercentageData.push(occObj);
			$scope.twoGraphs.remainingPercentageData.push(remObj);		
			
		}
		
	};
	
	$scope.rePopulatebarGraphData = function(){
		$scope.barGraphData 			= [];
		
		for(var i=3;i<$scope.gridOptions.columnDefs.length;i++){
			var comObj 			= {component:'', occ:'', rem:''};
			comObj.component 	= $scope.gridOptions.columnDefs[i].name;
			
			var devDays = parseInt($scope.selectedReleaseCup.devDays);
			var gridApiColIndex= -1;
			
			//Find aggregation value of colum  occObj.label
			for(j in $scope.gridApi.grid.columns){
				if($scope.gridApi.grid.columns[j].name == comObj.component){
					gridApiColIndex = j;
					break;					
				}
			}
			
			//Calculating Percentage
			var aggregateValue 		= $scope.gridApi.grid.columns[gridApiColIndex].getAggregationValue();
			var percentValOcc		= (aggregateValue/devDays)*100;
			var percentValRem		= ((devDays-aggregateValue)/devDays)*100;
			
			comObj.occ = $scope.graphFormatter(percentValOcc,"");
			comObj.rem = $scope.graphFormatter(percentValRem,"");
			
			$scope.barGraphData.push(comObj);		
		}
		
	};
	
	$scope.rePopulatebarGraphIPMData = function(){
		
		$scope.barGraphIPMData = [];
		var devDays = parseInt($scope.selectedReleaseCup.devDays);
		
		//Iterate Each IPM
		for(var i=0;i<$scope.ipmArray.length;i++){
			var ipmName = $scope.ipmArray[i].ipm;
			
			var comObj 			= {ipmName:'', occ:'', rem:''};
			comObj.ipmName 		= ipmName;
			
			var IPMRow = null;
			//Iterate thru Matrix to Get Appropriate IPM ROW
			for(index in $scope.gridOptions.data){
				var matrixRow = $scope.gridOptions.data[index];
				if(matrixRow.IPM == ipmName){
					IPMRow = matrixRow;
					break;
				}
			}
			var percentValOcc		= 0;
			var percentValRem		= 100;
			
			if(IPMRow != null){
				var total = 0;
				for(var j=2;j<$scope.gridOptions.columnDefs.length;j++){
					var columName = $scope.gridOptions.columnDefs[j].name;
					var value = (IPMRow[columName] == undefined || IPMRow[columName] == '' || isNaN(IPMRow[columName]) ) ? 0 : parseInt(IPMRow[columName]);
					total += value;
				}
				percentValOcc		= (total/devDays)*100;
				percentValRem		= ((devDays-total)/devDays)*100;
			}
			
			
			comObj.occ = $scope.graphFormatter(percentValOcc,"");
			comObj.rem = $scope.graphFormatter(percentValRem,"");
			
			$scope.barGraphIPMData.push(comObj);
			
		}
	};
	
	$scope.updateLastClicked = function(){
		var currentDate = new Date();
		var names 	= "names=lastClicked";
		var values 	= "values="+currentDate.toISOString();
		var data = "uuid="+$scope.selectedReleaseCup.uuid+"&"+names+"&"+values+"&"+"delimiter=;;;";
		var update = UpdateObjectService.save(data);
		update.$promise.then(
				function(data){
					console.log("Response LastClick: ",data);
				},
				function(error){
					console.log("Error: ",error);
				});
	};
	
	$scope.getReleaseCup();
	//$scope.generateIpmNodeInTree("IPM1",["Smart Prompt"],["Controller","UI","QE","UX"]);
	
}


angular.module('releasecupdetail',['ngAnimate','ui.router','ui-notification','ui.tree'])
	.controller('ReleaseCupDetailController',['$scope','$stateParams','$state','Notification','loadContext','ErrorUtils','context','$timeout','ReleasesService','UpdateObjectService','ReleasesCupService','uiGridConstants','$filter','IPMService','ServiceUtils','editableOptions',ReleaseCupDetailController]);
	