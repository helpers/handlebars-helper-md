/**
 * Handlebars Helpers: {{md}}
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT License (MIT).
 */

// Node.js
var path = require('path');

// node_modules
var yfm = require('assemble-yaml');
var minimatch = require('minimatch');
var marked = require('marked');
var _ = require('lodash');


// Export helpers
module.exports.register = function (Handlebars, options, params) {

  'use strict';

  var assemble = params.assemble;
  var grunt = params.grunt;
  options = options || {};

  // var markedDefaults = {
  //   renderer: new marked.Renderer(),
  //   gfm: true,
  //   tables: true,
  //   breaks: false,
  //   pedantic: false,
  //   sanitize: true,
  //   smartLists: true,
  //   smartypants: false
  // };

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
  Handlebars.registerHelper('md', function(name, context) {
    // opts = _.extend({}, markedDefaults, options.marked, options.hash);

    // Set marked.js options
    // marked.setOptions(opts);

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
      ctx = grunt.config.process(ctx);

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
};
