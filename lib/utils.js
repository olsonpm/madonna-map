'use strict';


//---------//
// Imports //
//---------//

const fp = require('lodash/fp');


//------//
// Init //
//------//

const mutableSet = getMutableSet();


//------//
// Main //
//------//

const defineProp = fp.curry(
  (name, desc, obj) => Object.defineProperty(obj, name, desc)
);

const mapValuesWithKey = fp.ary(2, fp.mapValues.convert({ cap: false }));


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

const zipToManyObjects = function zipToManyObjects() {
  const props = arguments[0];
  return fp.map(
    fp.flow(
      fp.zipObject(props)
      , fp.omitBy(fp.isUndefined)
    )
  )(fp.tail(arguments));
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
const zipToManyObjectsWithKey = fp.flow(
  fp.spread(zipToManyObjects)
  , fp.keyBy('key')
  , fp.mapValues(fp.omit('key'))
);


//-------------//
// Helper Fxns //
//-------------//

function getMutableSet() { return fp.set.convert({ immutable: false }); }


//---------//
// Exports //
//---------//

module.exports = {
  defineProp: defineProp
  , mapValuesWithKey: mapValuesWithKey
  , mutableSet: mutableSet
  , zipToManyObjects: zipToManyObjects
  , zipToManyObjectsWithKey: zipToManyObjectsWithKey
};
