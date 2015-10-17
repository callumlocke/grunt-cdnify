/**
 * grunt-cdnify
 * https://github.com/callumlocke/grunt-cdnify
 *
 * Copyright 2014 Callum Locke
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path'),
    url = require('url'),
    Soup = require('soup'),
    chalk = require('chalk'),
    rewriteCSSURLs = require('css-url-rewriter');

// Helper function
function isLocalPath(filePath, mustBeRelative) {
  return typeof filePath === 'string' && filePath.length &&
    filePath.indexOf('//') === -1 &&
    filePath.indexOf('data:') !== 0 &&
    (!mustBeRelative || filePath[0] !== '/');
}

// Default options
var defaults = {
    html: true,
    css: true
};

var htmlDefaults = {
  'img[data-src]': 'data-src',
  'img[src]': 'src',
  'link[rel="apple-touch-icon"]': 'href',
  'link[rel="icon"]': 'href',
  'link[rel="shortcut icon"]': 'href',
  'link[rel="stylesheet"]': 'href',
  'script[src]': 'src',
  'source[src]': 'src',
  'video[poster]': 'poster'
};

module.exports = function (grunt) {
  grunt.registerMultiTask('cdnify', 'Converts local URLs to CDN ones.', function () {

    var options = this.options(defaults);

    var filesCount = {
        css: 0,
        html: 0
    };

    // Handle HTML selector:attribute settings
    if (options.html === false) {
      options.html = {};
    } else if (options.html === true) {
      options.html = htmlDefaults;
    } else if (typeof options.html === 'object') {
      for (var key in htmlDefaults) {
        if (htmlDefaults.hasOwnProperty(key)) {
          if (options.html[key] === null || options.html[key] === undefined) {
            options.html[key] = htmlDefaults[key];
          }
        }
      }
    } else {
      throw new TypeError('Expected `options.html` to be boolean or object');
    }

    // Establish the rewriteURL function for this task
    var rewriteURL = options.rewriter,
        base = options.base;

    if (typeof base === 'string') {
      rewriteURL = function (origUrl) {
        return isLocalPath(origUrl) ? url.resolve(base, origUrl) : origUrl;
      };
    } else if (typeof rewriteURL !== 'function') {
      grunt.fatal('Please specify either a `base` string or a `rewriter` function in the task options.');
      return;
    }

    this.files.forEach(function (file) {
      var srcFile = file.src,
          destFile = file.dest;

      if (typeof srcFile !== 'string') {
        if (srcFile.length > 1) {
          grunt.log.warn('Multiple source files supplied for single destination; only the first will be used.');
        }
        srcFile = srcFile[0];
      }
      if (!grunt.file.exists(srcFile)) {
        return grunt.log.warn('Source file ' + chalk.cyan(path.resolve(srcFile)) + ' not found.');
      }

      if (/\.css$/.test(srcFile)) {
        // It's a CSS file
        var oldCSS = grunt.file.read(srcFile),
            newCSS = options.css ?
              rewriteCSSURLs(oldCSS, rewriteURL) :
              oldCSS;

        grunt.file.write(destFile, newCSS);
        grunt.verbose.writeln(chalk.bold('Wrote CSS file: ') + chalk.cyan(destFile));
        filesCount.css++;
      } else {
        // It's an HTML file
        var oldHTML = grunt.file.read(srcFile),
            soup = new Soup(oldHTML);

        for (var search in options.html) {
          if (options.html.hasOwnProperty(search)) {
            var attr = options.html[search];
            if (attr) {
              soup.setAttribute(search, attr, rewriteURL);
            }
          }
        }

        // Update the URLs in any embedded stylesheets
        if (options.css) {
          soup.setInnerHTML('style', function (css) {
            return rewriteCSSURLs(css, rewriteURL);
          });
        }

        // Write it to disk
        grunt.file.write(destFile, soup.toString());
        grunt.verbose.writeln(chalk.bold('Wrote HTML file: ') + chalk.cyan(destFile));
        filesCount.html++;
      }

    });

    if (filesCount.css > 0) {
      grunt.log.ok('Wrote ' + chalk.cyan(filesCount.css.toString()) + ' CSS ' + grunt.util.pluralize(filesCount.css, 'file/files'));
    }
    if (filesCount.html > 0) {
      grunt.log.ok('Wrote ' + chalk.cyan(filesCount.html.toString()) + ' HTML ' + grunt.util.pluralize(filesCount.html, 'file/files'));
    }

  });
};
