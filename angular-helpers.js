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
    .constant('MODULE_VERSION', '0.0.8')
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
            link: function (scope, elm, attrs, ctrl) {
                var regex = /^-?\d*(\.\d+)?$/;
                var minRange = attrs.minRange;
                var maxRange = attrs.maxRange;
                var validator = function (value) {
                    var isValid = regex.test(value);
                    if (isValid && minRange) {
                        isValid = Number(minRange) <= Number(value);
                    }
                    if (isValid && maxRange) {
                        isValid = Number(value) <= Number(maxRange);
                    }
                    ctrl.$setValidity('validNumber', isValid);
                    return value;
                };
                // add a parser that will process each time the value is
                // parsed into the model when the user updates it.
                ctrl.$parsers.unshift(validator);
                // add a formatter that will process each time the value
                // is updated on the DOM element.
                ctrl.$formatters.unshift(validator);
            }
        };
    }]);
;
// and so on