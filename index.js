/**
 * Handlebars Helpers: {{md}}
 * Copyright (c) 2014 Jon Schlinkert
 * Licensed under the MIT License (MIT).
 */

'use strict';

// Node.js
var path      = require('path');

// node_modules
var marked    = require('marked');
var extras    = require('marked-extras');
var matter    = require('gray-matter');
var minimatch = require('minimatch');
var file      = require('fs-utils');
var _         = require('lodash');

// Export helpers
module.exports.register = function (Handlebars, options, params) {

  options = options || {};
  options.marked = options.marked || {};

  extras.init(options.marked);

  var assemble = params.assemble;
  var grunt = params.grunt;
  var markedDefaults = extras.markedDefaults;

  /**
   * {{md}}
   * Alternative to Assemble's built-in {{md}} helper
   */
  Handlebars.registerHelper('md', function(name, context, opts) {
    opts = _.extend({sep: '\n'}, markedDefaults, options.marked, options.hash || {});

    var i = 0;
    var result = '';
    var data;

    // Set marked.js options
    marked.setOptions(opts);

    // Convert inline markdown by prepending the name string with `:`
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

    /**
     * Accepts two objects (a, b),
     * @param  {Object} a
     * @param  {Object} b
     * @return {Number} returns 1 if (a >= b), otherwise -1
     */
    var compareFn = function (a, b) {
      var opts = _.extend({sortOrder: 'asc', sortBy: 'index'}, options);

      a = a.data[opts.sortBy];
      b = b.data[opts.sortBy];

      var result = 0;
      result = a > b ? 1 : a < b ? -1 : 0;
      if(opts.sortOrder.toLowerCase() === 'desc') {
        return result * -1;
      }
      return result;
    };


    var src = filepaths.map(function(filepath) {
      i += 1;
      name = path.basename(filepath, path.extname(filepath));

      // Process context, using YAML front-matter,
      // grunt config and Assemble options.data
      var page = matter.read(filepath) || {};
      var metadata = page.context || {};

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

      data = Handlebars.createFrame(ctx.data);
      data.filepath  = filepath;

      var template = Handlebars.partials[name];
      var fn = Handlebars.compile(template);
      var output = fn(ctx);

      // Prepend or append any content in the given partial to the output
      var md = options.md || options.data.md || {};
      var append = '';
      var prepend = '';

      if(md.prepend) {
        prepend = Handlebars.compile(Handlebars.partials[md.prepend])(ctx, {data: data});
      }
      if(md.append) {
        append = Handlebars.compile(Handlebars.partials[md.append])(ctx, {data: data});
      }

      return {
        data: data,
        prepend: prepend,
        append: append,
        content: marked(output)
      };
    }).sort(options.compare || compareFn).map(function (obj) {
      if(options.debug) {file.writeDataSync(options.debug, obj);}

      // Return content from src files
      return obj.prepend + obj.content + obj.append;
    }).join(options.sep);

    result += src;

    return new Handlebars.SafeString(result);
  });

  /**
   * Process templates using grunt.config.data and context
   */
  var processContext = function(grunt, context) {
    grunt.config.data = _.defaults(context || {}, _.cloneDeep(grunt.config.data));
    return grunt.config.process(grunt.config.data);
  };
};
