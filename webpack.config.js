'use strict';


//---------//
// Imports //
//---------//

var nodeExternals = require('webpack-node-externals')
  , path = require('path')
  , stripEs6Externals = require('strip-es6-externals')
  ;


//------//
// Init //
//------//

var exclude = /node_modules/
  , test = /\.js$/
  , wmodule = {
    loaders: [
      {
        test: test
        , exclude: exclude
        , loader: 'babel'
        , query: { presets: ['babel-preset-es2015'] }
      }, {
        test: /package\.json$/
        , exclude: exclude
        , loader: 'json'
      }
    ]
  }
  ;


//------//
// Main //
//------//

var testEntry = './tests/es6.js';

var res = [
  {
    entry: './lib/index.js'
    , target: 'node'
    , externals: [
      stripEs6Externals()
      , nodeExternals()
    ]
    , output: {
      path: __dirname
      , filename: 'es5.js'
      , pathinfo: true
      , libraryTarget: 'commonjs2'
    }
    , module: wmodule
  }, {
    entry: testEntry
    , target: 'node'
    , externals: [
      stripEs6Externals(testEntry)
      , nodeExternals()
    ]
    , output: {
      path: path.join(__dirname, 'tests')
      , filename: 'es5.js'
      , pathinfo: true
      , libraryTarget: 'commonjs2'
    }
    , module: wmodule
  }
];



//---------//
// Exports //
//---------//

module.exports = res;
