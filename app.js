// http://stat.abs.gov.au/sdmxws/sdmx.asmx
// http://www.abs.gov.au/ausstats/abs@.nsf/Lookup/1407.0.55.002main+features82013


var myApp = angular.module('myApp', ['ngRoute', 'ngAnimate']);   // Reference angular-route and angular-animate

// Set up routes for my app, using angular-route
myApp.config(['$routeProvider', function($routeProvider) {
    
    $routeProvider
    .when('/', {
        templateUrl: 'pages/combinations.html',
        controller: 'combinationsController'
    })
    .when('/norway', {
        templateUrl: 'pages/graphs.html',
        controller: 'graphController'
    })
    .when('/coolness', {
        templateUrl: 'pages/angularCoolness.html',
        controller: 'coolController'
    })
    .otherwise({
        redirectTo: '/coolness'
    });
}]);

// Service for caching results from the ssb.no api call.
myApp.service('graphResultCacher', function() {
    
    this.peopleNorwayResults;
    
});


myApp.controller('combinationsController', ['$scope', '$log', '$timeout', function($scope, $log, $timeout) {

    "use strict";
                                            
    const speedMs = 1000;
    
    $scope.heading = 'Calculating combinations...';
    $scope.subHeadning = 'Please be patient';
    $scope.numCombinations = 1;
    
    $scope.combinations = [ 
        { value: 1},
        { value: 1},
        { value: 1},
        { value: 0},
        { value: 0}
    ];

    $scope.calculateCombinations = function(array) {

        if(!checkInput(array)) {
            $scope.numCombinations = -1;
            return;
        }

        const end = array.length - 1;
        let i = swapNext1AsFarAsItCanGo(array).indexOfLast1;
        
        // [1,0,0,0,1] i=1. a) Move last 1 to pos i+1 (here: Middle)  b) move next 1 to pos i
        // [0,1,1,0,0] <-- result
        
        // [1,0,0,0,1] --> [0,1,1,0,0] i=1, j=end-1
        // [1,0,0,1,1] --> [0,1,1,1,0] i=1, j=end-2
        while(i > 0) {
            swap(array, i+1, end);
            swapWithNext(array, i-1);
            let result = swapNext1AsFarAsItCanGo(array);
            i = result.indexOfLast1;
        }

    };

    // Searches from back of array, until a 1 is found that can be swapped, then swaps it as far to the right as it can go
    // Returns index of last 1 that can be swapped.
    // Returns -1 if there aren't any 1's in the array that can be swapped (no 1's with a 0 to it's right)
    function swapNext1AsFarAsItCanGo(array) {
        const end = array.length - 1;
        let i = findIndexOfLast1NotAtTheEnd(array);
        if(i !== -1) {
            for(let j = i; j < end; j++) {
                if(array[j+1] === 1) {  // If next number is a 1, stop swapping. So in this situation: [1,0,1,1] - it will find the first 1 and only swap once.
                    return {indexOfLast1: i, numbersAtTheEnd: end-j};
                }
                swapWithNext(array, j);
            }
        }
        return {indexOfLast1: i, numbersAtTheEnd: 1};
    }
    
    function findIndexOfLast1NotAtTheEnd(array) {
        
        const end = array.length - 1;
        for(let i = end; i >= 0; i--) {
            if(i !== end && array[i] === 1 && array[i+1] === 0) {
                return i;
            }
        }
        return -1;
        
    }
    
    function checkInput(array) {
        
        let zeroEncountered = false;
        for(let i = 0; i < array.length; i++) {
            if(array[i] === 0) {
                zeroEncountered = true;
            }
            if(zeroEncountered === true && array[i] === 1) {
                return false;
            }
        }
        return true;

    }
    
    function swapWithNext(array, x) {

        swap(array, x, x+1);
        $scope.numCombinations = $scope.numCombinations + 1;
        //console.log(array);

    }
    
    function swap(array, x, y) {

        let temp = array[x];
        array[x] = array[y];
        array[y] = temp;

    };
    
    //swap($scope.combinations, 2, 3, speedMs);
    //swap($scope.combinations, 3, 4, speedMs);

}]);

myApp.controller('graphController', ['$scope', '$log', '$http', 'graphResultCacher', function($scope, $log, $http, resultCacher) {

    "use strict";

    $log.info('Starting graphController');

    var yearsXAxis = [];
    var numPeopleYAxis = [];
    var sectorArray = [];

    $scope.graphErrorMsg = '';

    function createSectorLabel(startNumber, endNumber, numPeopleInSector, totalNumPeople){
        return startNumber + '-' + endNumber + ' years: ' + ((numPeopleInSector / totalNumPeople) * 100).toFixed(2) + '%';
    }
    
    // Draw barchart using values from yearsXAxis and numPeopleYAxis
    $scope.initBarChart = function(yearsArray, peopleArray) {
        $(function() {
            $log.info('initBarChart staring .. ');
            $('#highchartsContainer').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'People in Norway'
                },
                subtitle: {
                    text: 'By age'
                },
                xAxis: {
                    categories: yearsArray,
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: { text: 'Number of people'}
                },
                series: [{
                    name: 'Number of people in Norway',
                    data: peopleArray
                }]
            });
            
        });
    };
    
    // Function for draw sector chart, showing people in Norway by 10 year age group
    $scope.initDonutChart = function(sectorDataArray) {
        $(function() {
            $log.info('initDonutChart staring .. ');
            
            $('#highchartsDonut').highcharts({
                chart: {
                    type: 'pie',
                    options3d: {
                        enabled: true,
                        alpha: 45
                    }
                },
                title: {
                    text: 'People in Norway'
                },
                subtitle: {
                    text: 'by 10 year age group'
                },
                plotOptions: {
                    pie: {
                        innerSize: 50,
                        depth: 30
                    }
                },
                series: [{
                    name: 'Number of people',
                    data: sectorDataArray
                }]
            });
        });
    };
    
    function drawGraphs(dataset) {
        
        let totalNumPeopleInNorway = 0;

        for(let v in dataset.value) {
            totalNumPeopleInNorway = totalNumPeopleInNorway + dataset.value[v];
        }

        let i = 0;
        let lastV = 0;
        for (let v in dataset.value) {
            yearsXAxis.push(v);
            numPeopleYAxis.push(dataset.value[v]);

            if(v != 0 && v % 10 === 0) {
                let sectorLabel = createSectorLabel(v-10, v-1, i, totalNumPeopleInNorway);
                sectorArray.push([sectorLabel, i]);
                i = dataset.value[v];
            } else {
                i = i + dataset.value[v];
            }
            lastV = v;
        }
        let sectorLabel = createSectorLabel(100, lastV, i, totalNumPeopleInNorway);
        sectorArray.push([sectorLabel, i]);

        $log.debug(sectorArray);

        $scope.initBarChart(yearsXAxis, numPeopleYAxis);
        $scope.initDonutChart(sectorArray);

    };

    if(resultCacher.peopleNorwayResults) {

        drawGraphs(resultCacher.peopleNorwayResults.dataset);

    } else {

        $http.get("https://data.ssb.no/api/v0/dataset/1074.json?lang=no")
        .success(function(result) {
            resultCacher.peopleNorwayResults = result;
            $log.info('Finished downloading from ssb.');
            $log.debug(result);
            drawGraphs(result.dataset);
            
        })
        .error(function(data, status) {
            $log.error(data + ' status = ' + status);
            $scope.graphErrorMsg = 'Download error, status code: ' + status + ', ' + data;
        });
                
    }   // End else
        
}]);

myApp.controller('coolController', ['$scope', '$timeout', '$filter', '$log', '$http', function($scope, $timeout, $filter, $log, $http) {
    "use strict";
    
    const progressChangeSpeed = 100;
    const progressChangeInterval = 10;
    
	$scope.boxname = "";
	$scope.name = "Jon-Thomas";
    $scope.procent = "0";
    $scope.peopleNorway = '';
	
    function setProcent(procent) {
        $log.debug("setProcent was called");
        $scope.procent = procent;
        if(procent < 100) {
            $timeout(function() {
                setProcent(procent + progressChangeInterval);
            }, progressChangeSpeed);
        }
        else if (procent === 100) {
            $scope.name = "World";
        }
    }
    
	$timeout(function() {
        setProcent(progressChangeInterval);
    }, progressChangeSpeed);
    
	$timeout(function() {
		$scope.name = "Bronia";
	}, 1500);
	
	$scope.boxNameToLower = function() {
		return $filter('lowercase')($scope.boxname);
	};
    
    //$http.post('http://stat.abs.gov.au/sdmxws/sdmx.asmx', )
    

}]);
