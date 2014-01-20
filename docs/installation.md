Install with [npm](npmjs.org):

```
npm i {%= name %} --save-dev`
```

Install with [bower](https://github.com/bower/bower):

```
bower install {%= name %} --save-dev`
```


## Register the helper

The easiest way to register the helper with [Assemble](https://github.com/assemble/assemble) is to add the module to `devDependencies` and `keywords` in your project's package.json:

```json
{
  "devDependencies": {
    "{%= name %}": "*"
  },
  "keywords": [
    "{%= name %}"
  ]
}
```

Alternatively, to register the helper explicitly in the Gruntfile:

```javascript
grunt.initConfig({
  assemble: {
    options: {
      // the '{%= name %}' npm module must also be listed in
      // devDependencies for assemble to automatically resolve the helper
      helpers: ['{%= name %}', 'foo/*.js']
    },
    files: {
      'dist/': ['src/templates/*.hbs']
    }
  }
});
```