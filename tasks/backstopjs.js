/*
 * grunt-backstopjs
 * https://github.com/m.disimone/grunt-backstopjs
 *
 * Copyright (c) 2016 Marcello di Simone
 * Licensed under the MIT license.
 */

'use strict';

const backstop = require('backstopjs');
const path = require('path');
const tmp = require('tmp');
const fs = require('fs');

/**
 *
 * @typedef {Object} options
 * @property {String} configPath
 * @property {String} id
 * @property {Array} viewports
 * @property {Array} scenarios
 * @property {Object} paths
 * @property {casperFlags} scenarios
 * @property {String} engine
 * @property {Array} report
 * @property {Boolean} debug
 */

/**
 *
 * @type {options}
 */
const OPTIONS_DEFAULT = {
  "id": "backstop_prod_test",
  "viewports": [],
  "scenarios": [],
  "paths": {
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "casper_scripts": "backstop_data/casper_scripts",
    "html_report": "backstop_data/html_report",
    "ci_report": "backstop_data/ci_report"
  },
  "casperFlags": [],
  "engine": "phantomjs",
  "report": ["browser"],
  "debug": false
};
const DESC = 'Running regression tests with backstopjs v.2';
const availableActions = ['reference', 'openReport', 'genConfig', 'test'];

module.exports = function (grunt) {

  grunt.registerMultiTask('backstopjs', DESC, function () {
    let versionType = this.args.shift(),
        action = (availableActions.indexOf(versionType) !== -1) ? versionType:'test',
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

    tmp.file({postfix: '.json'}, (err, path, fd, cleanupCallback) => {
      if (err) {
        grunt.fatal('Could not create temporary configuration file' );
      }
      fs.writeFile(path, JSON.stringify(options), () => {
        backstop(action, {config: path})
            .then(() => {
              grunt.log.ok('backstop ran successfully');
            })
            .catch((err) => {
              grunt.fatal(err);
            })
            .then(() => {
              grunt.verbose.writeln('Cleanup and finish');
              // cleanupCallback();
              done();
            });
      });
    });
  });
};
