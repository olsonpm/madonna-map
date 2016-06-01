'use strict';


//---------//
// Imports //
//---------//

const common = require('./common')
  , errorInfo = require('./error-info')
  , fp = require('lodash/fp')
  , madonna = require('madonna-fp')
  , madonnaFn = require('madonna-internal-fn')
  , utils = require('./utils')
  ;


//------//
// Init //
//------//

const createError = common.createError
  , errorPropIdToStringId = errorInfo.propIdToStringId.create
  , madonnaMapMarg = getMadonnaMapMarg()
  , mapValuesWithKey = utils.mapValuesWithKey
  ;


//------//
// Main //
//------//

const madonnaMap = {
  createMapper: madonnaFn({
    marg: madonnaMapMarg
    , fn: createMapper
  })
};

Object.defineProperty(madonnaMap, '_getArgMapSchema', { value: getArgMapSchema });

function createMapper(argsObj) {
  const argValidator = madonna.createSternValidator(argsObj.marg);

  return function(dirtyArgs) {
    argValidator.apply(null, arguments);

    // no errors, return the mapped results
    const argMap = argsObj.argMap;
    return fp.flow(
      fp.pick(fp.keys(argMap))
      , mapValuesWithKey((val, key) => argMap[key](val))
      , fp.assign(dirtyArgs)
    )(dirtyArgs);
  };
}


//-------------//
// Helper Fxns //
//-------------//

function getArgMapSchema(shouldRequire) {
  let flags = (shouldRequire)
    ? ['require', 'isLadenPlainObject']
    : ['isLadenPlainObject'];
  return {
    flags: flags
    , custom: {
      allFunctions: fp.all(fp.isFunction)
    }
  };
}

function getMadonnaMapMarg() {
  return {
    schema: {
      marg: ['require', 'isLadenPlainObject']
      , argMap: getArgMapSchema(true)
    }
    , opts: {
      cb: furtherValidateMadonnaMap
    }
  };
}

function furtherValidateMadonnaMap(argsObj) {
  const keysAllowed = fp.keys(margToLonghand(argsObj.marg).schema)
    , keysToTest = fp.keys(argsObj.argMap);

  // argMap must only contain keys contained within the first level of schema
  const invalidKeys = fp.difference(keysToTest, keysAllowed);
  if (invalidKeys.length) {
    throw createError(
      'Invalid Input'
      , "argMap can only contain keys present in schema.\n"
        + "invalid keys: " + invalidKeys.join(', ') + "\n"
        + "keys allowed: " + keysAllowed.join(', ')
      , errorPropIdToStringId.mapKeysMustMatchSchema
    );
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
