'use strict';


//---------//
// Imports //
//---------//

const chai = require('chai')
  , errorInfo = require('../lib/error-info')
  , fp = require('lodash/fp')
  , madonna = require('madonna-fp/es6')
  , madonnaMap = require('../es6')
  ;


//------//
// Init //
//------//

chai.should();
const madonnaErrorIds = madonna.ERROR_IDS
  , errorPropIdToStringId = errorInfo.propIdToStringId.create
  ;


//------//
// Main //
//------//

describe('createMapper', () => {
  it('should correctly map the argument', () => {
    const mapper = madonnaMap.createMapper({
      marg: {
        name: ['require', 'isLadenString']
        , age: {
          flags: ['isInteger']
          , betweenI: [0, 120]
        }
      }
      , argMap: {
        name: fp.toUpper
      }
    });

    mapper({ name: 'phil' }).should.deep.equal({ name: 'PHIL' });

    mapper({ name: 'phil', age: 28 }).should.deep.equal({ name: 'PHIL', age: 28 });
  });
  it('should throw correct errors', () => {
    let err;

    try {
      madonnaMap.createMapper({
        marg: { name: ['require', 'isLadenString'] }
        , argMap: { notName: fp.toUpper }
      });
    } catch (e) { err = e; }
    err.id.should.equal(errorPropIdToStringId.mapKeysMustMatchSchema);
    err = undefined;

    const mapper = madonnaMap.createMapper({
      marg: { name: ['require', 'isLadenString'] }
      , argMap: { name: fp.toUpper }
    });

    try { mapper({ name: { notALadenString: 'fail' } }); }
    catch(e) { err = e; }
    err.id.should.equal(madonnaErrorIds.criterionFailed);
  });
});
