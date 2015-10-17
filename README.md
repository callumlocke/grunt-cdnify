# grunt-cdnify

[![NPM version][npm-image]][npm-url] [![Linux Build Status][travis-image]][travis-url] [![Windows Build Status][appveyor-image]][appveyor-url] [![Dependency Status][depstat-image]][depstat-url] [![devDependency Status][devDepstat-image]][devDepstat-url]

> Converts local URLs to CDN ones.

## What it does
The task looks through your specified files for URLs to rewrite, in the following places:

* `<img data-src="____">`
* `<img src="____">`
* `<link rel="apple-touch-icon" href="____">`
* `<link rel="icon" href="____">`
* `<link rel="shortcut icon" href="____">`
* `<link rel="stylesheet" href="____">`
* `<script src="____"></script>`
* `<source src="____"></source>`
* `background-image: url(____);` in your CSS (including inside `<style>` tags in your HTML)

See options below for how it modifies them.

## Options
You should set either `base` **or** `rewriter` (not both).

### base
For the most common use case, just set a `base` string for your URLs – e.g., `'//cdn.example.com/'`.
The cdnify task will automatically search for all **local** URLs in your files, and prefix them with this string.
(It will automatically avoid double-slashes.)

Example:

```js
cdnify: {
  someTarget: {
    options: {
      base: '//cdn.example.com/stuff/'
    },
    files: [{
      expand: true,
      cwd: 'app',
      src: '**/*.{css,html}',
      dest: 'dist'
    }]
  }
}
```

### rewriter
For more control, you can specify a custom `rewriter` function instead. In this case,
the task will search for **all** URLs (not just local ones) and run your function on each one.
Your function should return the new value.

Example:

```js
cdnify: {
  someTarget: {
    options: {
      rewriter: function (url) {
        if (url.indexOf('data:') === 0) {
          return url;            // leave data URIs untouched
        } else {
          return url + '?12345'; // add query string to all other URLs
        }
      }
    },
    files: [{
      expand: true,
      cwd: 'app',
      src: '**/*.{css,html}',
      dest: 'dist'
    }]
  }
}
```

### css (boolean)
Whether to modify CSS. Applies to both `*.css` files and `<style>` elements. Default: `true`.

### html (boolean/object)
Whether/how to modify HTML. Defaults to `true`, which will update HTML according to this standard config:

```js
{
  'img[data-src]': 'src',
  'img[src]': 'src',
  'link[rel="]': 'href',
  'link[rel="shortcut icon"]': 'href',
  'link[rel=icon]': 'href',
  'link[rel=stylesheet]': 'href',
  'script[src]': 'src',
  'source[src]': 'src',
  'video[poster]': 'poster'
}
```

That is, any elements matching the CSS selector `img[src]` will have their `src` attributes cdnified, etc.

To customise this config, you can set the `html` option to an object of custom `selector:attribute` pairs.
These will be added to the standard set shown above – if you want to **not** use one of the standard pairs,
you have to explicitly override it with `false`.

For example:

```js
options: {
  html: {
    'img[ng-src]': 'ng-src', // cdnify angular images
    'script[src]': false     // don't cdnify script tags
  }
}
```


---

## License

[The MIT License](http://opensource.org/licenses/MIT)

[npm-url]: https://npmjs.org/package/grunt-cdnify
[npm-image]: https://img.shields.io/npm/v/grunt-cdnify.svg?style=flat-square

[travis-url]: http://travis-ci.org/callumlocke/grunt-cdnify
[travis-image]: https://img.shields.io/travis/callumlocke/grunt-cdnify.svg?style=flat-square&label=Linux%20build

[appveyor-url]: https://ci.appveyor.com/project/callumlocke/grunt-cdnify/branch/master
[appveyor-image]: https://img.shields.io/appveyor/ci/callumlocke/grunt-cdnify/master.svg?style=flat-square&label=Windows%20build

[depstat-url]: https://david-dm.org/callumlocke/grunt-cdnify
[depstat-image]: https://img.shields.io/david/callumlocke/grunt-cdnify.svg?style=flat-square

[devDepstat-url]: https://david-dm.org/callumlocke/grunt-cdnify
[devDepstat-image]: https://img.shields.io/david/dev/callumlocke/grunt-cdnify.svg?style=flat-square#info=devDependencies
