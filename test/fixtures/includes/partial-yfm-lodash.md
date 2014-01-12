---
title: <%= site.title %>
description: <%= site.description %>
---
<article id="partial-yfm-lodash">
  <h1 class="title">
    {{title}} => {{site.title}}
  </h1>
  <p class="description"> {{description}} </p>
  <p class="description"> {{site.description}} </p>
</article>

Note that the YAML front matter is "borrowing" data from the `site` object, which is defined in the Grunt config.

So in this example, `\{{title}}` will yield the same result as `\{{site.title}}`, and `\{{description}}` will
yield the same result as `\{{site.description}}`



***

## Example HTML

> Below this line is HTML converted from Markdown

## Emphasis

### Bold
For emphasizing a snippet of text with a heavier font-weight.

The following snippet of text is **rendered as bold text**.

``` markdown
**rendered as bold text**
```
and this HTML

``` html
<strong>rendered as bold text</strong>
```

### Italics
For emphasizing a snippet of text with italics.

The following snippet of text is _rendered as italicized text_.

``` markdown
_rendered as italicized text_
```
and this HTML:

``` html
<em>rendered as italicized text</em>
```