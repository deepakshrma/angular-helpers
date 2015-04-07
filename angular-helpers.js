/**
 * Created by deepak on 7/4/15.
 */
// 1. define the module and the other module dependencies (if any)
angular.module('ngHelpers', [])
    .constant('MODULE_VERSION', '0.0.1')
    .factory('_', function () {
        return window._; // assumes underscore has already been loaded on the page
    })
    .directive('validNumber', ['_', function (_) {
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