/*
 * grunt-backstop2
 * https://github.com/m.disimone/grunt-backstop2
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

module.exports = function (grunt) {

  grunt.registerTask('backstop2', DESC, function (versionType) {
    let action = 'reference',
        done = this.async(),
        options,
        configFilePath = path.resolve(this.data.options.configPath),
        configFile = {};

    if (configFilePath && grunt.file.isFile(configFilePath)) {
      grunt.verbose.log('Loading the backstop configuration file');
      configFile = require(configFilePath);
    }

    options = this.options(OPTIONS_DEFAULT, configFile, this.data);

    switch (versionType) {
      case 'backstop2-reference':
        grunt.verbose.log('Running the backstopjs reference task');
        action = 'reference';
        break;
      case 'backstop2-openReport':
        grunt.verbose.log('Running the backstopjs openReport task');
        action = 'openReport';
        break;
      case 'backstop2-genConfig':
        grunt.verbose.log('Running the backstopjs genConfig task');
        action = 'genConfig';
        break;
      case 'backstop2-test':
        /* falls through */
      default:
        grunt.verbose.log('Running the backstopjs test task');
        action = 'test';
    }

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
              grunt.verbose.log('Cleanup and finish');
              cleanupCallback();
              done();
            });
      });
    });
  });

  grunt.registerTask('backstop2-reference', DESC, function (versionType) {
    grunt.task.run('backstop2:' + (versionType || '') + ':backstop2-reference');
  });

  grunt.registerTask('backstop2-test', DESC, function (versionType) {
    grunt.task.run('backstop2:' + (versionType || '') + ':backstop2-test');
  });

  grunt.registerTask('backstop2-openReport', DESC, function (versionType) {
    grunt.task.run('backstop2:' + (versionType || '') + ':backstop2-openReport');
  });

  grunt.registerTask('backstop2-genConfig', DESC, function (versionType) {
    grunt.task.run('backstop2:' + (versionType || '') + ':backstop2-genConfig');
  });
};
