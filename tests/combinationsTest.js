// to start Karma: "./node_modules/karma/bin/karma start"
// or, if karma_cli is installed via npm: "karma start"

describe('combinationsController', function() {

    'use strict';
    
    beforeEach(module('myApp'));

    let $controller;

    beforeEach(inject(function(_$controller_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));

    describe('calculateCombinations with small sets', function() {

        let $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller('combinationsController', { $scope: $scope });
        });

        it('counts 1 combination, given 3 distinct elements in a set of 3', function() {
            $scope.calculateCombinations([1,1,1]);
            expect($scope.numCombinations).toEqual(1);
        });

        it('counts 1 combinations, given 1 distinct element in a set of 1', function() {
            $scope.calculateCombinations([1]);
            expect($scope.numCombinations).toEqual(1);
        });

        it('counts 2 combinations, given 1 distinct element in a set of 2', function() {
            $scope.calculateCombinations([1, 0]);
            expect($scope.numCombinations).toEqual(2);
        });
      
        it('throws error when the 1s arent at the start of the array', function() {
            $scope.calculateCombinations([0,1]);
            expect($scope.numCombinations).toEqual(-1);
        });
      
        it('counts 3 combinations, given 1 distinct element in a set of 3', function() {
            $scope.calculateCombinations([1,0,0]);
            expect($scope.numCombinations).toEqual(3);
        });

        it('counts 7 combinations, given 1 distinct element in a set of 7', function() {
            $scope.calculateCombinations([1,0,0,0,0,0,0]);
            expect($scope.numCombinations).toEqual(7);
        });
      
        it('counts 3 combinations, given 2 distinct elements in a set of 3', function() {
            $scope.calculateCombinations([1,1,0]); 
            expect($scope.numCombinations).toEqual(3);
        });
      
    });
    
    describe('calculateCombinations with sets of 4', function() {

        let $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller('combinationsController', { $scope: $scope });
        });

        it('counts 1 combination, given 4 distinct elements', function() {
            $scope.calculateCombinations([1,1,1,1]);
            expect($scope.numCombinations).toEqual(1);
        });

        it('counts 6 combinations, given 2 distinct elements', function() {
            $scope.calculateCombinations([1,1,0,0]);
            expect($scope.numCombinations).toEqual(6); 
        });

        it('counts 4 combinations, given 3 distinct elements', function() {
            $scope.calculateCombinations([1,1,1,0]);
            expect($scope.numCombinations).toEqual(4); 
        });

    });

    describe('calculateCombinations with sets of 5', function() {

        let $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller('combinationsController', { $scope: $scope });
        });

        it('counts 1 combination, given 5 distinct elements', function() {
            $scope.calculateCombinations([1,1,1,1,1]);
            expect($scope.numCombinations).toEqual(1);
        });

        it('counts 10 combinations, given 2 distinct elements', function() {
            $scope.calculateCombinations([1,1,0,0,0]);
            expect($scope.numCombinations).toEqual(10);
        });

        it('counts 10 combinations, given 3 distinct elements', function() {
            $scope.calculateCombinations([1,1,1,0,0]);
            expect($scope.numCombinations).toEqual(10);
        });

        it('counts 5 combinations, given 4 distinct elements', function() {
            $scope.calculateCombinations([1,1,1,1,0]);
            expect($scope.numCombinations).toEqual(5);
        });

    });

});