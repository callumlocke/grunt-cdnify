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
      myTarget: {
        options: {
          base: '//cdn.example.com/stuff/'
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures',
          src: '*.{css,html}',
          dest: 'test/output'
        }]
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
