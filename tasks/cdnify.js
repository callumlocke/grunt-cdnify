/*
  grunt-cdnify
  https://github.com/callumlocke/grunt-cdnify

  Copyright 2014 Callum Locke
  Licensed under the MIT license.
*/

'use strict';

var path = require('path'),
    Soup = require('soup'),
    rewriteCSSURLs = require('css-url-rewriter');


// Helper functions
function isLocalPath(filePath, mustBeRelative) {
  return (
    typeof filePath === 'string' && filePath.length &&
    (filePath.indexOf('//') === -1) &&
    (filePath.indexOf('data:') !== 0) &&
    (!mustBeRelative || filePath[0] !== '/')
  );
}

function joinBaseAndPath(base, urlPath) {
  if (base.indexOf('//') === -1) return base + urlPath;

  // Split out protocol first, to avoid '//' getting normalized to '/'
  var bits = base.split('//'),
      protocol = bits[0], rest = bits[1];
  // Trim any path off if this is a domain-relative URL
  if (urlPath[0] === '/')
    rest = rest.split('/')[0];
  // Join it all together
  return protocol + '//' + path.normalize("" + rest + "/" + urlPath);
}

// Default options
var defaults = {
  html: true,
  css: true
};

var htmlDefaults = {
  'img[src]': 'src',
  'link[rel=stylesheet]': 'href',
  'script[src]': 'src',
  'video[poster]': 'poster',
  'source[src]': 'src'
};

module.exports = function (grunt) {
  grunt.registerMultiTask('cdnify', 'Converts relative URLs to absolute ones.', function() {

    var options = this.options(defaults);

    // Handle HTML selector:attribute settings
    if (options.html === false) options.html = {};
    else if (options.html === true) options.html = htmlDefaults;
    else if (typeof options.html === 'object') {
      for (var key in htmlDefaults) {
        if (htmlDefaults.hasOwnProperty(key) && options.html[key] == null) {
          options.html[key] = htmlDefaults[key];
        }
      }
    }
    else throw new TypeError('Expected options.html to be boolean or object');

    // Establish the rewriteURL function for this task
    var rewriteURL;
    if (typeof options.base === 'string') {
      rewriteURL = function (url) {
        if (isLocalPath(url))
          return joinBaseAndPath(options.base, url);
        return url;
      };
    }
    else if (typeof options.rewriter !== 'function') {
      grunt.fatal('Please specify either a "base" string or a "rewriter" function in the task options.');
      return;
    }
    else {
      rewriteURL = options.rewriter;
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
        return grunt.log.warn("Source file \"" + (path.resolve(srcFile)) + "\" not found.");
      }
      else {
        if (/.css$/.test(srcFile)) {
          // It's a CSS file.
          var oldCSS = grunt.file.read(srcFile),
              newCSS = options.css ?
                rewriteCSSURLs(oldCSS, rewriteURL) :
                oldCSS;

          grunt.file.write(destFile, newCSS);
          grunt.log.ok("Wrote CSS file: \"" + destFile + "\"");
        }
        else {
          // It's an HTML file.
          var oldHTML = grunt.file.read(srcFile),
              soup = new Soup(oldHTML);

          for (var search in options.html) {
            var attr = options.html[search];
            if (attr) soup.setAttribute(search, options.html[search], rewriteURL);
          }

          // Update the URLs in any embedded stylesheets
          if (options.css)
            soup.setInnerHTML('style', function (css) {
              return rewriteCSSURLs(css, rewriteURL);
            });

          // Write it to disk
          grunt.file.write(destFile, soup.toString());
          grunt.log.ok("Wrote HTML file: \"" + destFile + "\"");
        }
      }
    });
  });
};
