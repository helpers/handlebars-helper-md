/**
 * Handlebars Helpers: {{md}}
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT License (MIT).
 */

'use strict';


// Node.js
var fs = require('fs');

// node_modules
var hljs = require('highlight.js');
var _ = require('lodash');

// Local libs
hljs.registerLanguage('less', require('./less.js'));

// Export the 'utils' module
var utils = module.exports = {};

utils.readFile = function(src) {
  return fs.readFileSync(src, 'utf8');
};

utils.matchesExt = function (haystack, needles) {
  needles = Array.isArray(needles) ? needles : [needles];
  needles = (needles.length > 0) ? _.unique(_.flatten(needles)).join('|') : '.*';
  var re = new RegExp('(?:' + needles + ')', 'g');
  var matches = String(haystack).match(re);
  if (matches) {
    return true;
  } else {
    return false;
  }
};

// The fallback template to use for headings/anchors,
// if one isn't specified by the user
utils.fallbackHeadingTmpl = [
  '<h<%= level %>>',
  '  <a name="<%= _.slugify(text) %>" class="anchor" href="#<%= _.slugify(text) %>">',
  '    <span class="header-link"></span>',
  '  </a><%= text %>',
  '</h<%= level %>>'
].join('\n');

utils.languages = {
  xml: ['html', 'xml'],
  less: ['less'],
  yaml: ['yfm', 'yml', 'yaml'],
  markdown: ['markdown', 'md'],
  handlebars: ['handlebars', 'hbs'],
  javascript: ['javascript', 'js', 'json']
};

utils.highlight = function(code, lang) {
  if (lang === undefined) {lang = 'bash';}
  for (var language in utils.languages) {
    if (utils.languages.hasOwnProperty(language)) {
      if(utils.matchesExt(lang, utils.languages[language])) {
        lang = language;
      }
    }
  }
  return '<div class="code-example">' + hljs.highlight(lang, code).value + '</div>';
};

