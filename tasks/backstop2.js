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

module.exports = function (grunt) {

  grunt.registerMultiTask('backstop2', 'The best Grunt plugin ever.', function () {
    let done = this.async(),
        options,
        configFilePath = path.resolve(this.data.options.configPath),
        configFile = {};

    if (configFilePath && grunt.file.isFile(configFilePath)) {
      configFile = require(configFilePath);
    }

    options = this.options(OPTIONS_DEFAULT, configFile, this.data);

    tmp.file({postfix: '.json'}, (err, path, fd, cleanupCallback) => {
      fs.writeFile(path, JSON.stringify(options), () => {
        backstop('reference', {config: path})
            .catch((err) => {
              throw err;
            })
            .then(() => {
              cleanupCallback();
              done();
            });
      });
    });
  });

};
