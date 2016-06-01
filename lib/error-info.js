'use strict';


//---------//
// Imports //
//---------//

const fp = require('lodash/fp')
  , utils = require('./utils');


//------//
// Init //
//------//

const ERROR_PREFIX = 'map'
  , mapValuesWithKey = utils.mapValuesWithKey
  , zipToManyObjectsWithKey = utils.zipToManyObjectsWithKey
  ;


//------//
// Main //
//------//

const errorInfo = {
  create: getCreateInfo()
};

const propIdToStringId = mapPropIdToStringId(errorInfo);


//-------------//
// Helper Fxns //
//-------------//

function getCreateInfo() {
  return zipToManyObjectsWithKey([
    ['key', 'stringId', 'dataKeys']
    , ['mapKeysMustMatchSchema', 'map-keys-must-match-schema']
  ]);
}

function mapPropIdToStringId(errorInfo) {
  return mapValuesWithKey(
    (val, key) => fp.mapValues(innerVal => ERROR_PREFIX + '_' + key + '_' + innerVal.stringId, val)
    , errorInfo
  );
}


//---------//
// Exports //
//---------//

module.exports = {
  propIdToStringId: propIdToStringId
  , ERROR_PREFIX: ERROR_PREFIX
};
