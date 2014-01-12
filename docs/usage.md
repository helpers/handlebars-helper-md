With the helper registered, you may now begin using it in your templates:

```html
{{md 'foo'}}
```

## Gruntfile configuration

```js
assemble: {
  options: {
    partials: ['test/fixtures/includes/*.md'],
  },
  files: {
    'dest/': ['src/*.{hbs,md}']
  }
}
```

Optionally pass in a context as the second parameter:

```html
{{md 'foo' bar}}
```

### Wildcard patterns

Globbing patterns may also be used:

```html
{{md 'chapter-*' bar}}
```


### Set marked.js options in the Gruntfile

```js
assemble: {
  options: {
    // marked.js options
    marked: {
      sanitize: true,
      // see test/fixtures/render/heading.tmpl
      headings: 'anchors.tmpl'
    },
    partials: ['includes/*.md'],
  },
  files: {
    'dest/': ['src/*.{hbs,md}']
  }
}
```