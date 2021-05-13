var app = angular.module('myApp', ['ui.bootstrap','iService.directive','ngAnimate','ui.select','datatables', 'datatables.bootstrap', 'datatables.buttons']);

 app.controller('knowledgebaseCtrl', function ($scope, $window,$uibModal, DTOptionsBuilder, DTColumnDefBuilder) {
    $scope.tabtype = 'home';
	$scope.type = 'home';
	$scope.openPreviewModal  = function(){
	  $uibModal.open({
		templateUrl : 'preview.html',
		controller: 'knowledgebaseCtrl',
		scope: $scope
	  });
	}
	$scope.dtResultOptions = DTOptionsBuilder
		.newOptions().withDisplayLength(5).withOption('language', {
			search: 'Filter Results'
		})
		.withBootstrap().withButtons([ 'copy', 'excel', 'pdf', {
			extend: 'colvis',
			columns: function (index, apiObj, headCell)
			{
				// The attribute data-no-col-vis in the markup is a custom marker that indicates that I want to
				// disable the show/hide column functionality for certain columns
				return headCell.dataset.noColVis === undefined;
			}
		}]);
	$scope.showOptionTab = function (segmentName)
	{ 
		//angular.element(document.querySelectorAll(".top-menu-section a")).removeClass("selected");
		$scope.tabtype = segmentName;
		$scope.type = segmentName;
		$scope.config = {}; 
			$scope.config.toolbarGroups = [
			{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
			{ name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
			{ name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
			{ name: 'forms', groups: [ 'forms' ] },
			{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
			{ name: 'links', groups: [ 'links' ] }
		];
		
		this.addActive(segmentName);
			// 
	};
	$scope.showOption = function (segmentName)
	{   
	   $scope.type = segmentName;
	   $scope.config = {}; 
            $scope.config.toolbarGroups = [
			{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
			{ name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
			{ name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
			{ name: 'forms', groups: [ 'forms' ] },
			{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
			{ name: 'links', groups: [ 'links' ] }
		];
		 // 
	};

	$scope.addActive = function (segmentName)
	{ 
		if(segmentName == 'home')
		{
		  $scope.home = true;
		  $scope.topiclist = false;
		  $scope.subscription = false;
		  $scope.questionform = false;
		  $scope.history = false;
		  $scope.profile = false;
		}
		if(segmentName == 'topiclist'){
			$scope.home = false;
			$scope.topiclist = true;
			$scope.subscription = false;
			$scope.questionform = false;
			$scope.history = false;
			$scope.profile = false;
		}
		if(segmentName == 'subscription')
		{
			$scope.home = false;
			$scope.topiclist = false;
			$scope.subscription = true;
			$scope.questionform = false;
			$scope.history = false;
			$scope.profile = false;
		}
		if(segmentName == 'questionform'){
			$scope.home = false;
			$scope.topiclist = false;
			$scope.subscription = false;
			$scope.questionform = true;
			$scope.history = false;
			$scope.profile = false;
		}
		if(segmentName == 'history')
		{
			$scope.home = false;
			$scope.topiclist = false;
			$scope.subscription = false;
			$scope.questionform = false;
			$scope.history = true;
			$scope.profile = false;

		}
		if(segmentName == 'profile'){
			$scope.home = false;
			$scope.topiclist = false;
			$scope.subscription = false;
			$scope.questionform = false;
			$scope.history = false;
			$scope.profile = true;
		}
	}
			
});

app.controller('TopicCtrl', function ($scope, $http, $timeout, $interval) {
var vm = this;
vm.topicselected = {selected : "Select or search for a topic in the list ..."};
	vm.topic = [
	{name: 'e-shop -- All Topics',topiclevel:0, disabled: '', segment:"Segment"},
	{name: '_Feedback',topiclevel:1, disabled: 'false', segment:"Segment"},
	{name: '_Newsletter Subscription ',topiclevel:1, disabled: 'disabled', segment:"Segment"},
	{name: '_Spam',topiclevel:1, disabled: '', segment:"Segment"},
	{name: '_Undeliverable',topiclevel:1, disabled: '', segment:"Segment"},
	{name: 'Account Questions',topiclevel:0, disabled: '', segment:"Segment"},
	{name: 'Orders',topiclevel:1, disabled: '', segment:"Segment"},
	{name: 'Refunds',topiclevel:1, disabled: 'disabled', segment:"Segment"},
	{name: 'Returns',topiclevel:1, disabled: '', segment:"Segment"},
	{name: 'Products',topiclevel:0, disabled: '', segment:"Segment"},
	{name: 'Audio-Video',topiclevel:1, disabled: '', segment:"Segment"},
	{name: 'Cameras',topiclevel:1, disabled: '', segment:"Segment"},
	{name: 'Cell Phones',topiclevel:1, disabled: '', segment:"Segment"},
	{name: 'Computers',topiclevel:1, disabled: '', segment:"Segment"},
	{name: 'Televisions',topiclevel:1, disabled: '', segment:"Segment"},
	{name: 'Shipping',topiclevel:1, disabled: '', segment:"Segment"},
	{name: 'Technical Support',topiclevel:1, disabled: '', segment:"Segment"},
	{name: 'Open Quotes',topiclevel:1, disabled: '', segment:"Segment"}
];
});


