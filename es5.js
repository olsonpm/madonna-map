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
  !*** ./lib/index.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var common = __webpack_require__(/*! ./common */ 1),
	    errorInfo = __webpack_require__(/*! ./error-info */ 4),
	    fp = __webpack_require__(/*! lodash/fp */ 2),
	    madonna = __webpack_require__(/*! madonna-fp */ 5),
	    madonnaFn = __webpack_require__(/*! madonna-internal-fn */ 6),
	    utils = __webpack_require__(/*! ./utils */ 3);

	//------//
	// Init //
	//------//

	var createError = common.createError,
	    errorPropIdToStringId = errorInfo.propIdToStringId.create,
	    madonnaMapMarg = getMadonnaMapMarg(),
	    mapValuesWithKey = utils.mapValuesWithKey;

	//------//
	// Main //
	//------//

	var madonnaMap = {
	  createMapper: madonnaFn({
	    marg: madonnaMapMarg,
	    fn: createMapper
	  })
	};

	Object.defineProperty(madonnaMap, '_getArgMapSchema', { value: getArgMapSchema });

	function createMapper(argsObj) {
	  var argValidator = madonna.createSternValidator(argsObj.marg);

	  return function (dirtyArgs) {
	    argValidator.apply(null, arguments);

	    // no errors, return the mapped results
	    var argMap = argsObj.argMap;
	    return fp.flow(fp.pick(fp.keys(argMap)), mapValuesWithKey(function (val, key) {
	      return argMap[key](val);
	    }), fp.assign(dirtyArgs))(dirtyArgs);
	  };
	}

	//-------------//
	// Helper Fxns //
	//-------------//

	function getArgMapSchema(shouldRequire) {
	  var flags = shouldRequire ? ['require', 'isLadenPlainObject'] : ['isLadenPlainObject'];
	  return {
	    flags: flags,
	    custom: {
	      allFunctions: fp.all(fp.isFunction)
	    }
	  };
	}

	function getMadonnaMapMarg() {
	  return {
	    schema: {
	      marg: ['require', 'isLadenPlainObject'],
	      argMap: getArgMapSchema(true)
	    },
	    opts: {
	      cb: furtherValidateMadonnaMap
	    }
	  };
	}

	function furtherValidateMadonnaMap(argsObj) {
	  var keysAllowed = fp.keys(margToLonghand(argsObj.marg).schema),
	      keysToTest = fp.keys(argsObj.argMap);

	  // argMap must only contain keys contained within the first level of schema
	  var invalidKeys = fp.difference(keysToTest, keysAllowed);
	  if (invalidKeys.length) {
	    throw createError('Invalid Input', "argMap can only contain keys present in schema.\n" + "invalid keys: " + invalidKeys.join(', ') + "\n" + "keys allowed: " + keysAllowed.join(', '), errorPropIdToStringId.mapKeysMustMatchSchema);
	  }

	  return { isValid: true };
	}

	// These two functions should really exist in madonna-fp, just unsure how the
	//   api should look.
	function margToLonghand(marg) {
	  if (margIsShorthand(marg)) {
	    marg = { schema: marg, opts: {} };
	  }
	  return marg;
	}
	function margIsShorthand(marg) {
	  return !marg.schema;
	}

	//---------//
	// Exports //
	//---------//

	module.exports = madonnaMap;

/***/ },
/* 1 */
/*!***********************!*\
  !*** ./lib/common.js ***!
  \***********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var fp = __webpack_require__(/*! lodash/fp */ 2),
	    utils = __webpack_require__(/*! ./utils */ 3);

	//------//
	// Init //
	//------//

	var mutableSet = utils.mutableSet,
	    defineProp = utils.defineProp;

	//------//
	// Main //
	//------//

	var createError = function createError(name, msg, id) {
	  return fp.flow(mutableSet('name', name), defineProp('id', { enumerable: true, value: id }))(new Error(msg));
	};

	//---------//
	// Exports //
	//---------//

	module.exports = {
	  createError: createError
	};

/***/ },
/* 2 */
/*!****************************!*\
  !*** external "lodash/fp" ***!
  \****************************/
/***/ function(module, exports) {

	module.exports = require("lodash/fp");

/***/ },
/* 3 */
/*!**********************!*\
  !*** ./lib/utils.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var fp = __webpack_require__(/*! lodash/fp */ 2);

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
/* 4 */
/*!***************************!*\
  !*** ./lib/error-info.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var fp = __webpack_require__(/*! lodash/fp */ 2),
	    utils = __webpack_require__(/*! ./utils */ 3);

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
/* 5 */
/*!*****************************!*\
  !*** external "madonna-fp" ***!
  \*****************************/
/***/ function(module, exports) {

	module.exports = require("madonna-fp");

/***/ },
/* 6 */
/*!**************************************!*\
  !*** external "madonna-internal-fn" ***!
  \**************************************/
/***/ function(module, exports) {

	module.exports = require("madonna-internal-fn");

/***/ }
/******/ ]);