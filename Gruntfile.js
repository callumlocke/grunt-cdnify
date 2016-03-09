/*
  grunt-cdnify
  https://github.com/callumlocke/grunt-cdnify

  Copyright 2013 Callum Locke
  Licensed under the MIT license.
*/

'use strict';

module.exports = function(grunt) {
  var path = require('path'),
      url = require('url');

  grunt.initConfig({

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: {
        src: [
          'tasks/*.js',
          'Gruntfile.js',
          '<%= nodeunit.tests %>'
        ]
      }
    },

    clean: {
      tests: 'test/output'
    },

    nodeunit: {
      tests: 'test/cdnify_test.js'
    },

    cdnify: {
      options: {
        base: '//cdn.example.com/stuff/'
      },
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
            'img[src]': false,
            'img[data-src]': false
          }
        },
        files: {
          'test/output/sample-custom-options.html': 'test/fixtures/sample.html'
        }
      },
      customRewriter: {
        options: {
          base: false,
          rewriter: function (originalURL, dirname) {
            // If it looks like an absolute URL (based on a simplistic regexp match), don't do any rewrites.
            if (!originalURL.match(/^(\w+:)?\/\//)) {
              // If it's a relative path (no leading slash), assume it's relative to the src file and
              // rebase it to be relative to the test/fixtures/ directory instead.
              if (originalURL && originalURL[0] !== '/') {
                originalURL = path.relative('test/fixtures/', path.resolve(dirname, originalURL));
              }

              return url.resolve('//cdn.example.com/', path.join('stuff/', originalURL));
            }

            return originalURL;
          }
        },
        files: {
          'test/output/css/custom-rewriter.css': 'test/fixtures/css/custom-rewriter.css',
          'test/output/html/custom-rewriter.html': 'test/fixtures/html/custom-rewriter.html'
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

  grunt.registerTask('test', ['clean', 'jshint', 'cdnify', 'nodeunit']);

  grunt.registerTask('default', ['watch']);
};
