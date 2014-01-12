With the helper registered, you may now begin using it in your templates:

```html
{{md 'foo'}}
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
