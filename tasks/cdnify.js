/*
  grunt-cdnify
  https://github.com/callumlocke/grunt-cdnify

  Copyright 2014 Callum Locke
  Licensed under the MIT license.
*/

'use strict';

var path = require('path'),
    Soup = require('soup'),

    // Regex to find CSS properties that contain URLs
    // Fiddle: http://refiddle.com/by/callum-locke/css-url-matcher
    // Railroad: http://goo.gl/LXpk52
    cssPropertyMatcher = /[;\s]\*?[a-zA-Z\-]+\s*\:\s*url\(\s*['"]?[^'"\)\s]+['"]?\s*\)[^;}]*/g,

    // Regex to find the URLs within a CSS property value
    // Fiddle: http://refiddle.com/by/callum-locke/match-multiple-urls-within-a-css-property-value
    // Railroad: http://goo.gl/vQzMcg
    urlMatcher = /url\(\s*['"]?([^)'"]+)['"]?\s*\)/g;


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
  // Split out protocol first, to avoid '//' getting normalized to '/'
  var bits = base.split('//'),
      protocol = bits[0], rest = bits[1];
  // Trim any path off if this is a domain-relative URL
  if (urlPath[0] === '/')
    rest = rest.split('/')[0];
  // Join it all together
  return protocol + '//' + path.normalize("" + rest + "/" + urlPath);
}

function cdnifyURL(url, options) {
  if (isLocalPath(url))
    return joinBaseAndPath(options.base, url);
  return url;
}

function convertURLsInCSS(css, options) {
  return css.toString().replace(cssPropertyMatcher, function(property, urlValue, offset) {
    switch (property.split(':')[0].indexOf('behavior')) {
      case 0:
      case 1:
        return property;
    }
    return property.replace(urlMatcher, function(urlFunc, justURL, offset) {
      var cdnifiedURL;
      cdnifiedURL = cdnifyURL(justURL, options);
      return urlFunc.replace(justURL, cdnifiedURL);
    });
  });
}

// The task
module.exports = function(grunt) {
  grunt.registerMultiTask('cdnify', 'Converts relative URLs to absolute ones.', function() {

    var options = this.options();

    this.files.forEach(function(file) {
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
          // Just run it through the CSS-processing function
          grunt.file.write(destFile, 
            convertURLsInCSS(grunt.file.read(srcFile), options)
          );
          grunt.log.ok("Wrote CSS file: \"" + destFile + "\"");
        }
        else {
          // It's an HTML file.
          var oldHTML = grunt.file.read(srcFile),
              soup = new Soup(oldHTML);

          // Update image URLs
          soup.setAttribute('img[src]', 'src', function (oldValue) {
            return cdnifyURL(oldValue, options);
          });

          // Update stylesheet URLs
          soup.setAttribute('link[rel=stylesheet]', 'href', function (oldValue) {
            return cdnifyURL(oldValue, options);
          });

          // Update script URLs
          soup.setAttribute('script[src]', 'src', function (oldValue) {
            return cdnifyURL(oldValue, options);
          });

          // Update the URLs in any embedded stylesheets
          soup.setInnerHTML('style', function (css) {
            return convertURLsInCSS(css, options);
          });

          // Write it to disk
          grunt.file.write(destFile, soup.toString());
        }
      }
    });
  });
};
