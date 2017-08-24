/*
 * grunt-backstopjs
 * https://github.com/m.disimone/grunt-backstopjs
 *
 * Copyright (c) 2016 Marcello di Simone
 * Licensed under the MIT license.
 */

'use strict';

const backstopjs = require('backstopjs');
const path = require('path');
const tmp = require('tmp');
const fs = require('fs');

/**
 * RGB configuration of the error colors
 * @typedef {Object} Color
 * @property {Number} red     Numeric value of Red 0-255
 * @property {Number} green   Numeric value of Green 0-255
 * @property {Number} blue    Numeric value of Blue 0-255
 */

/**
 * Special Settings for the error output
 * @typedef {Object} ResembleOutputOptions
 * @property {Color}  [errorColor]      Color settings for highlighting differences in regression test results
 * @property {String} [errorType]       Error type e.g. 'movement' @see https://github.com/Huddle/Resemble.js
 * @property {Number} [transparency]    Transparency value 0-1
 */

/**
 * Configuration of output paths for the regression test results
 * @typedef {Object} Paths
 * @property {String} bitmaps_reference   Path of the reference image to test against
 * @property {String} bitmaps_test        Path of the regression test results
 * @property {String} [engine_scripts]    Root path to scripts defined in onReadyScript and onBeforeScript
 * @property {String} [html_report]       Output path of the HTML report
 * @property {String} [ci_report]         Output poth of the CI report
 */

/**
 * Configuration of a single viewport for the regression test
 * @typedef {Object} Viewport
 * @property {String} [name]    Name of the viewport is used for the output
 * @property {Number} width     Width of the viewport
 * @property {Number} height    Height of the viewport
 */

/**
 * Configuration for the CI reporter
 * @typedef {Object} CIOptions
 * @property {String} format                Format of the CI report
 * @property {String} testReportFileName    Name for the file of the report output
 * @property {String} testSuiteName         Name of the Test Suit
 */

/**
 * Scenario describing a regression setup
 * @typedef {Object}    Scenario
 * @property {String}   label                   Tag saved with your reference images
 * @property {String}   url                     The url of your app state
 * @property {String[]} selectors               Array of selectors to capture. Defaults to document if omitted. Use
 *                                              "viewport" to capture the viewport size. See Targeting elements in the
 *                                              next section for more info...
 * @property {String}   [onBeforeScript]        Used to set up browser state e.g. cookies.
 * @property {String}   [readySelector]         Wait until this selector exists before continuing.
 * @property {String}   [readyEvent]            Wait until this string has been logged to the console.
 * @property {Number}   [delay]                 Wait for x millisections
 * @property {String[]} [hideSelectors]         Array of selectors set to visibility: hidden
 * @property {String[]} [removeSelectors]       Array of selectors set to display: none
 * @property {String}   [onReadyScript]         After the above conditions are met -- use this script to modify UI
 *                                              state prior to screen shots e.g. hovers, clicks etc.
 * @property {Boolean}  [selectorExpansion]     See Targeting elements in the next section for more info...
 * @property {Number}   [misMatchThreshold]     Around of change before a test is marked failed
 * @property {Boolean}  [requireSameDimensions] If set to true -- any change in selector size will trigger a test failure.
 */

/**
 * Backstop configuration settings
 * @typedef {Object}                  Options
 * @property {String}                 [configPath]            Grunt specific property to define an external config json
 * @property {String}                 id                      ID of the regression test
 * @property {Viewport[]}             viewports               List of viewport settings
 * @property {Scenario[]}             scenarios               List of scenario settings
 * @property {Paths}                  paths                   List of output paths
 * @property {CIOptions}              [ci]                    List of CI reporter names
 * @property {String[]}               [casperFlags]           Extra CasperJS flags to run the tests with
 * @property {String}                 [engine='phantom']      Browser engine name possible values 'chrome', 'slimerjs', 'phantom'
 * @property {String[]}               [report]                List of CI Reporters possible values 'browser', 'CI'
 * @property {Boolean}                [debug=false]           Enables debug output
 * @property {Number}                 [asyncCompareLimit=50]  Limit of async test running in parallel
 * @property {ResembleOutputOptions}  [resembleOutputOptions] Extra settings for the resemble Output
 */

/**
 * Default configuration settings
 * @type {Options}
 */
const OPTIONS_DEFAULT = {
  "id": "backstop_test",
  "viewports": [
    {
      "name": "desktop",
      "width": 1024,
      "height": 768
    }
  ],
  "scenarios": [],
  "paths": {
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test"
  }
};
const DESC = 'Running regression tests with backstopjs v.2';
const availableActions = ['test', 'reference'];

module.exports = function (grunt) {

  grunt.registerMultiTask('backstopjs', DESC, function () {
    let versionType = this.args.shift(),
        action = (availableActions.indexOf(versionType) !== -1) ? versionType : 'test',
        done = this.async(),
        options,
        configFilePath = path.resolve(this.data.options.configPath),
        configFile = {};

    if (configFilePath && grunt.file.isFile(configFilePath)) {
      grunt.verbose.writeln('Loading the backstop configuration file');
      configFile = require(configFilePath);
    }

    options = this.options(OPTIONS_DEFAULT, configFile, this.data);
    delete options.options;
    delete options.configPath;

    if (Array.isArray(options.scenarios) && options.scenarios.length === 0) {
      grunt.fatal('You have to provide at least one scenario');
    }
    if (Array.isArray(options.viewports) && options.viewports.length === 0) {
      grunt.warn('You have not provided a viewport configuration, the default (1024x768) will be used.');
    }
    tmp.file({postfix: '.json'}, (err, path, fd, cleanupCallback) => {
      if (err) {
        grunt.fatal('Could not create temporary configuration file');
      }
      fs.writeFile(path, JSON.stringify(options), () => {
        backstopjs(action, {config: path})
            .then(() => {
              grunt.log.ok('backstop ran successfully');
            })
            .catch((err) => {
              grunt.fatal(err);
            })
            .then(() => {
              grunt.verbose.writeln('Cleanup and finish');
              cleanupCallback();
              done();
            });
      });
    });
  });
};
