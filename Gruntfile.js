/*
  grunt-cdnify
  https://github.com/callumlocke/grunt-cdnify

  Copyright 2013 Callum Locke
  Licensed under the MIT license.
*/

'use strict';

module.exports = function(grunt) {
  grunt.initConfig({

    clean: {
      tests: ['test/output']
    },

    nodeunit: {
      tests: ['test/cdnify_test.js']
    },

    cdnify: {
      options: { base: '//cdn.example.com/stuff/' },
      defaultOptions: {
        files: {
          'test/output/sample.css': 'test/fixtures/sample.css',
          'test/output/sample.html': 'test/fixtures/sample.html'
        }
      },
      customOptions: {
        options: {
          html: {
            'img[truffles]': 'truffles',
            'img[ng-src]': 'ng-src',
            'img[src]': false
          },
        },
        files: {
          'test/output/sample-custom-options.html': 'test/fixtures/sample.html'
        }
      }
    },

    watch: {
      all: {
        files: ['tasks/*.js', 'test/*.js'],
        tasks: ['test']
      }
    }

  });

  grunt.loadTasks('tasks');
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('test', ['clean', 'cdnify', 'nodeunit']);

  grunt.registerTask('default', ['watch']);
};
