/**
 * Handlebars Helpers: {{md}}
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT License (MIT).
 */

'use strict';

// Node.js
var fs = require('fs');
var path = require('path');

// node_modules
var minimatch = require('minimatch');
var yfm = require('assemble-yaml');
var _ = require('lodash');
// Mix in the methods from underscore string
_.mixin(require('underscore.string'));

// Marked
var marked = require('marked');
var renderer = new marked.Renderer();

// Highlight.js
var hljs = require('highlight.js');

// Local libs
var utils = require('./lib/utils');

// Export helpers
module.exports.register = function (Handlebars, options, params) {
  var assemble = params.assemble;
  var grunt = params.grunt;
  options = options || {};
  options.marked = options.marked || {};

  renderer.heading = function (text, level) {
    var tmpl = options.marked.headings || utils.fallbackHeadingTmpl;
    var markup = utils.readFile(tmpl);
    return _.template(markup, {text: text, level: level});
  };

  var markedDefaults = {
    sanitize: false,
    highlight: utils.highlight,
    renderer: renderer
  };

  /**
   * {{md}}
   * Alternative to Assemble's built-in {{md}} helper. See:
   * https://github.com/assemble/handlebars-helpers/blob/master/lib/helpers/helpers-markdown.js
   *
   * @param  {String} name    The name of the file to use
   * @param  {Object} context The context to pass to the file
   * @return {String}         Returns compiled HTML
   * @xample: {{md 'foo' bar}}
   */
  Handlebars.registerHelper('md', function(name, context, opts) {
    opts = _.extend({}, markedDefaults, options.marked, options.hash);

    // Set marked.js options
    marked.setOptions(opts);

    if(name.match(/^:/)) {
      return marked(name.replace(/^:/, ''));
    }

    if(!Array.isArray(assemble.partials)) {
      assemble.partials = [assemble.partials];
    }

    // first try to match on the full name in the assemble.partials array
    var filepaths = _.filter(assemble.partials, function(filepath) {
      return path.basename(filepath, path.extname(filepath)) === name;
    });

    // if no matches, then try minimatch
    if (!filepaths || filepaths.length <= 0) {
      filepaths = assemble.partials.filter(minimatch.filter(name));
    }

    var results = filepaths.map(function(filepath) {
      name = path.basename(filepath, path.extname(filepath));

      // Process context, using YAML front-matter,
      // grunt config and Assemble options.data
      var pageObj = yfm.extract(filepath) || {};
      var metadata = pageObj.context || {};

      // `context`           = the given context (second parameter)
      // `metadata`          = YAML front matter of the markdown file
      // `options.data[name]`   = JSON/YAML data file defined in Assemble options.data
      //                       with a basename matching the basename of the markdown file, e.g
      //                       {{md 'foo'}} => foo.json
      // `this`              = Typically either YAML front matter of the "inheriting" page,
      //                       layout, block expression, or "parent" helper wrapping this helper
      // `options`              = Custom properties defined in Assemble options
      // `grunt.config.data` = Data from grunt.config.data
      //                       (e.g. pkg: grunt.file.readJSON('package.json'))

      var ctx = _.extend({},
        grunt.config.data, options, this, options.data[name], metadata, context
      );

      // Process config templates
      ctx = processContext(grunt, ctx);

      var template = Handlebars.partials[name];
      var fn = Handlebars.compile(template);

      var output = fn(ctx).replace(/^\s+/, '');

      // Prepend output with the filepath to the original file
      var md = options.md || options.data.md || {};
      if(md.origin === true) {
        output = '<!-- ' + filepath + ' -->\n' + output;
      }

      return marked(output);
    }).join('\n');

    return new Handlebars.SafeString(results);
  });

  /**
   * Process templates using grunt.config.data and context
   */
  var processContext = function(grunt, context) {
    grunt.config.data = _.defaults(context || {}, _.cloneDeep(grunt.config.data));
    return grunt.config.process(grunt.config.data);
  };
};
