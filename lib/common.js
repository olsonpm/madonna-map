'use strict';


//---------//
// Imports //
//---------//

const fp = require('lodash/fp')
  , utils = require('./utils');


//------//
// Init //
//------//

const mutableSet = utils.mutableSet
  , defineProp = utils.defineProp;


//------//
// Main //
//------//

const createError = (name, msg, id) => {
  return fp.flow(
    mutableSet('name', name)
    , defineProp('id', { enumerable: true, value: id })
  )(new Error(msg));
};


//---------//
// Exports //
//---------//

module.exports = {
  createError: createError
};
