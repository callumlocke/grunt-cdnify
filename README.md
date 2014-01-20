# grunt-cdnify

Finds URLs of static resources in your HTML and CSS, and updates them to use your CDN host.

Places it looks for URLs to convert:

* `<img src="____">`
* `<script src="____"></script>`
* `<link rel="stylesheet" href="____">`
* `background-image: url(____);` in your CSS

Any *local* URLs found will be prefixed with a `base` string you provide.


## Basic usage

```javascript
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
