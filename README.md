# grunt-cdnify

Finds URLs of static resources in your HTML and CSS, and updates them to use your CDN host.

Any *local* URLs found in the following places will be prefixed with your specified `base` string:

* `<img src="____">`
* `<script src="____"></script>`
* `<link rel="stylesheet" href="____">`
* `background-image: url(____);` in your CSS


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
