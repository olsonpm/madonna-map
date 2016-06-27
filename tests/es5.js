module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**********************!*\
  !*** ./tests/es6.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var chai = __webpack_require__(/*! chai */ 1),
	    errorInfo = __webpack_require__(/*! ../lib/error-info */ 2),
	    fp = __webpack_require__(/*! lodash/fp */ 3),
	    madonna = __webpack_require__(/*! madonna-fp/es6 */ 5),
	    madonnaMap = __webpack_require__(/*! ../es6 */ 6);

	//------//
	// Init //
	//------//

	chai.should();
	var madonnaErrorIds = madonna.ERROR_IDS,
	    errorPropIdToStringId = errorInfo.propIdToStringId.create;

	//------//
	// Main //
	//------//

	describe('createMapper', function () {
	  it('should correctly map the argument', function () {
	    var mapper = madonnaMap.createMapper({
	      marg: {
	        name: ['require', 'isLadenString'],
	        age: {
	          flags: ['isInteger'],
	          betweenI: [0, 120]
	        }
	      },
	      argMap: {
	        name: fp.toUpper
	      }
	    });

	    mapper({ name: 'phil' }).should.deep.equal({ name: 'PHIL' });

	    mapper({ name: 'phil', age: 28 }).should.deep.equal({ name: 'PHIL', age: 28 });
	  });
	  it('should throw correct errors', function () {
	    var err = void 0;

	    try {
	      madonnaMap.createMapper({
	        marg: { name: ['require', 'isLadenString'] },
	        argMap: { notName: fp.toUpper }
	      });
	    } catch (e) {
	      err = e;
	    }
	    err.id.should.equal(errorPropIdToStringId.mapKeysMustMatchSchema);
	    err = undefined;

	    var mapper = madonnaMap.createMapper({
	      marg: { name: ['require', 'isLadenString'] },
	      argMap: { name: fp.toUpper }
	    });

	    try {
	      mapper({ name: { notALadenString: 'fail' } });
	    } catch (e) {
	      err = e;
	    }
	    err.id.should.equal(madonnaErrorIds.criterionFailed);
	  });
	});

/***/ },
/* 1 */
/*!***********************!*\
  !*** external "chai" ***!
  \***********************/
/***/ function(module, exports) {

	module.exports = require("chai");

/***/ },
/* 2 */
/*!***************************!*\
  !*** ./lib/error-info.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var fp = __webpack_require__(/*! lodash/fp */ 3),
	    utils = __webpack_require__(/*! ./utils */ 4);

	//------//
	// Init //
	//------//

	var ERROR_PREFIX = 'map',
	    mapValuesWithKey = utils.mapValuesWithKey,
	    zipToManyObjectsWithKey = utils.zipToManyObjectsWithKey;

	//------//
	// Main //
	//------//

	var errorInfo = {
	  create: getCreateInfo()
	};

	var propIdToStringId = mapPropIdToStringId(errorInfo);

	//-------------//
	// Helper Fxns //
	//-------------//

	function getCreateInfo() {
	  return zipToManyObjectsWithKey([['key', 'stringId', 'dataKeys'], ['mapKeysMustMatchSchema', 'map-keys-must-match-schema']]);
	}

	function mapPropIdToStringId(errorInfo) {
	  return mapValuesWithKey(function (val, key) {
	    return fp.mapValues(function (innerVal) {
	      return ERROR_PREFIX + '_' + key + '_' + innerVal.stringId;
	    }, val);
	  }, errorInfo);
	}

	//---------//
	// Exports //
	//---------//

	module.exports = {
	  propIdToStringId: propIdToStringId,
	  ERROR_PREFIX: ERROR_PREFIX
	};

/***/ },
/* 3 */
/*!****************************!*\
  !*** external "lodash/fp" ***!
  \****************************/
/***/ function(module, exports) {

	module.exports = require("lodash/fp");

/***/ },
/* 4 */
/*!**********************!*\
  !*** ./lib/utils.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var fp = __webpack_require__(/*! lodash/fp */ 3);

	//------//
	// Init //
	//------//

	var mutableSet = getMutableSet();

	//------//
	// Main //
	//------//

	var defineProp = fp.curry(function (name, desc, obj) {
	  return Object.defineProperty(obj, name, desc);
	});

	var mapValuesWithKey = fp.ary(2, fp.mapValues.convert({ cap: false }));

	// This function takes tabular-like data and creates an array of objects where
	//   the keys per object are the first row, and the values the subsequent rows.
	//   Words mean nothing without an example!
	//
	// zipToManyObjects([
	//  ['name', 'age', 'hairColor']
	//  , ['phil', 28, 'dark brown']
	//  , ['matt', 27, 'regular ole brown']
	// ])
	//
	// produces
	//
	// [
	//   {
	//     name: 'phil'
	//     , age: 28
	//     , hairColor: 'dark brown'
	//   }
	//   , {
	//     name: 'matt'
	//     , age: 27
	//     , hairColor: 'regular ole brown'
	//   }
	// ]

	var zipToManyObjects = function zipToManyObjects() {
	  var props = arguments[0];
	  return fp.map(fp.flow(fp.zipObject(props), fp.omitBy(fp.isUndefined)))(fp.tail(arguments));
	};

	// This function could be more efficient by avoiding zipObject (in zipToManyObjects),
	//   but I want to rely on its functionality for stability.
	//
	// Also to give a brief description of what this function does (the code doesn't
	//   spell it out very nicely), this takes an array of tabular-like data and
	//   creates an object from it.  This function assumes one of the columns has
	//   the name 'key'.  The following example makes this obvious:
	//
	// zipToManyObjectsWithKey([
	//  ['key', 'age', 'hairColor']
	//  , ['phil', 28, 'dark brown']
	//  , ['matt', 27, 'regular ole brown']
	// ])
	//
	// produces
	//
	// {
	//   phil: {
	//     age: 28
	//     , hairColor: 'dark brown'
	//   }
	//   , matt: {
	//     age: 27
	//     , hairColor: 'regular ole brown'
	//   }
	// }
	var zipToManyObjectsWithKey = fp.flow(fp.spread(zipToManyObjects), fp.keyBy('key'), fp.mapValues(fp.omit('key')));

	//-------------//
	// Helper Fxns //
	//-------------//

	function getMutableSet() {
	  return fp.set.convert({ immutable: false });
	}

	//---------//
	// Exports //
	//---------//

	module.exports = {
	  defineProp: defineProp,
	  mapValuesWithKey: mapValuesWithKey,
	  mutableSet: mutableSet,
	  zipToManyObjects: zipToManyObjects,
	  zipToManyObjectsWithKey: zipToManyObjectsWithKey
	};

/***/ },
/* 5 */
/*!*********************************!*\
  !*** external "madonna-fp/es5" ***!
  \*********************************/
/***/ function(module, exports) {

	module.exports = require("madonna-fp/es5");

/***/ },
/* 6 */
/*!*************************!*\
  !*** external "../es5" ***!
  \*************************/
/***/ function(module, exports) {

	module.exports = require("../es5");

/***/ }
/******/ ]);