/**
 * Deepak Vishwakarma
 *
 * Deepak Vishwakarma <http://github.com/deepakshrma>
 * Created and maintained by Deepak Vishwakarma
 * on 7/4/15
 *
 * Copyright (c) 2015 Deepak Vishwakarma.
 * Licensed under the MIT License (MIT).
 */

// 1. define the module and the other module dependencies (if any)
angular.module('ngHelpers', [])
    .constant('MODULE_VERSION', '0.1.1')
    .factory('lodash', function () {
        return window._; // assumes lodash has already been loaded on the page
    })
    .factory('helpers', function () {
        // Usage... for a nested structure
        // var test = {
        //    nested: {
        //      value: 'Read Correctly'
        //   }
        // };
        // safeRead(test, 'nested', 'value');  // returns 'Read Correctly'
        // safeRead(test, 'missing', 'value'); // returns ''
        //
        // http://thecodeabode.blogspot.com.au/2013/04/javascript-safely-reading-nested.html
        var safeRead = function () {
            var current, obj, prop, props, val, _i, _len, read;

            obj = arguments[0];
            props = (2 <= arguments.length) ? [].slice.call(arguments, 1) : [];

            read = function (obj, prop) {
                if ((obj !== null ? obj[prop] : void 0) === null) {
                    return;
                }
                return obj[prop];
            };

            current = obj;
            for (_i = 0, _len = props.length; _i < _len; _i++) {
                prop = props[_i];

                val = read(current, prop);
                if (val) {
                    current = val;
                } else {
                    return '';
                }
            }
            return current;
        };
        return {
            safeRead: safeRead
        };
    })
    .directive('validNumber', ['lodash', function (_) {
        return {
            // restrict to an attribute type.
            restrict: 'A',
            // element must have ng-model attribute.
            require: "ngModel",
            // scope = the parent scope
            // elem = the element the directive is on
            // attr = a dictionary of attributes on the element
            // ctrl = the controller for ngModel.
            link: function (that, element, attributes, ngModelController) {
                var regex = /^-?\d*(\.\d+)?$/;
                var minRange = attributes.minRange;
                var maxRange = attributes.maxRange;
                var validator = function (value) {
                    if (attributes.novalidate != 'true'){
                        var isValid = regex.test(value);
                        if (isValid && minRange) {
                            isValid = Number(minRange) <= Number(value);
                        }
                        if (isValid && maxRange) {
                            isValid = Number(value) <= Number(maxRange);
                        }
                        ngModelController.$setValidity('validNumber', isValid);
                    }
                   return value;
                };
                // add a parser that will process each time the value is
                // parsed into the model when the user updates it.
                ngModelController.$parsers.unshift(validator);
                // add a formatter that will process each time the value
                // is updated on the DOM element.
                ngModelController.$formatters.unshift(validator);
            }
        };
    }])
    //how to use directive
    /* <input type="text" name="amount" required data-ng-model="ctrl.amount"
    custom-validate func="ctrl.functionTovalidate validator-name="errorIdToSetInForm">
    ###########################################################################################
     <span custom-validate func="list.unitIdValidator" validator-name="isUnitValid" data-ng-model="list.selectedUnit">
     {{ (list.selectedUnit && list.selectedUnit.name) || ('shoppingList.selectAUnit' | translate)}}</span>
     */
    /*
    *My own custom validator function
     *  self.numberValidator = function (value) {
                var minRange = 1, regex = /^-?\d*(\.\d+)?$/;
                var isValid = regex.test(value);
                    if (isValid && minRange) {
                        isValid = Number(minRange) <= Number(value);
                    }
                return isValid;
                };
       self.unitIdValidator = function (unit) {
            return (unit && unit.id) ? true : false;
        };
    * */
    .directive('customValidate', ['$parse', function ($parse) {
        // Return the directive configuration. Notice that we are requiring the
        // ngModel controller to be passed into our linking function.
        return ({
            link: link,
            require: "ngModel",
            scope: {
                func: "&"
            },
            restrict: "A"
        });
// I bind the JavaScript events to the local scope.
        function link(that, element, attributes, ngModelController) {
            // Validate directive attributes.
            if (!attributes.func) {
                throw( new Error("customValidate requires func to validate.") );
            }
            // Validate directive attributes.
            if (!attributes.validatorName) {
                throw( new Error("customValidate requires validator-name to set form validation error") );
            }
            var func = that.func() || function () {
                    return true;
                };
            // add a parser that will process each time the value is
            // parsed into the model when the user updates it.
            ngModelController.$parsers.unshift(function (value) {
                if (attributes.novalidate != 'true')
                    ngModelController.$setValidity(attributes.validatorName, func(value));
                return value;
            });
            // add a formatter that will process each time the value
            // is updated on the DOM element.
            ngModelController.$formatters.unshift(function (value) {
                if (attributes.novalidate != 'true')
                    ngModelController.$setValidity(attributes.validatorName, func(value));
                return value;
            });
        }
    }])
    //how to use directive
    // <a class="link" file-downloader generate="generatePdfLink()" status="status" timeout="2000">
    // <span class="print-blue">&nbsp;</span>SKRIV UT
    // </a>
    // #######################OR###########################
    // <a class="link" file-downloader url="static/url/file.ext" status="status" timeout="2000">
    // <span class="print-blue">&nbsp;</span>SKRIV UT
    // </a>
    // #######################OR###########################
    // <a class="link" file-downloader urlmodel="yourmodel" status="status" timeout="2000">
    // <span class="print-blue">&nbsp;</span>SKRIV UT
    // </a>
    // #######################OR###########################
    .directive('fileDownloader', ['$http', '$q', function ($http, $q) {
        var _getFile = function (url) {
            var deferred = $q.defer();
            $http.get(url)
                .then(function (result) {
                    // Successful
                    deferred.resolve(result);
                },
                function (error) {
                    // Error
                    deferred.reject(error);
                });
            return deferred.promise;
        };
        var directive = {};
        directive.restrict = 'A';
        directive.scope = {
            urlmodel: "=",
            url: "@url",
            generate: "&",
            status: "="
        };
        directive.controller = ['$scope', '$window', '$timeout', function (that, $window, $timeout) {
            var getUrl = that.urlmodel || that.url || that.generate;
            var _status;
            that.download = function () {
                if (that.status)
                    return;
                var url = typeof getUrl == 'function' ? getUrl() : getUrl;
                if (url) {
                    _status = 'Loading'
                    that.status = _status;
                    var promise = _getFile(url);
                    promise.then(function (result) {
                        _status = 'Loaded';
                        $window.open(url, '_self', '');
                    }, function (error) {
                        _status = 'Failed';
                        console.log(error.data)
                    });
                    promise.finally(function () {
                        that.status = _status;
                        $timeout(function () {
                            _status = '';
                            that.status = '';
                        }, that.timeout);
                    });
                } else {
                    _status = '';
                    that.status = _status;
                }
            };
        }];
        directive.link = function (that, iElement, iAttrs, ctrl) {
            if (iAttrs.timeout)
                that.timeout = isNaN(Number(iAttrs.timeout)) ? 2000 : Number(iAttrs.timeout);
            iElement.on('click', that.download)
        }
        return directive;
    }]);
// and so on