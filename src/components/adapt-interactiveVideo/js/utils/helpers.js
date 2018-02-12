define([
    "./diffView"
], function(DiffView) {

    var preloads = {};
    var Preloader = DiffView.extend({
        renderOnInitialize: false,
        id: "interactive-video-preloader",
        postRender: function(isFirstRender) {
            if (isFirstRender) $("body").append(preloader.$el);
        },
        onRemove: function() {}
    },{
        template: "interactive-video-preloader"
    });
    var preloader = new Preloader({model:preloads});
    
	var Handlebars = require('handlebars'),
        helpers = {
            equals: function(value, text, block) {
                if (value == text) {
                    return block.fn(this);
                } else {
                    return block.inverse(this);
                }
            },
            compile: function(template, context) {
            	return Handlebars.compile(template)(context || this);
            },
            not: function(value) {
            	if (value) return "";
            	return "1";
            },
            compare: function(value, operator, text, block) {
                // Comparison operators
                switch (operator) {
                case "===":
                    if (value === text) return block.fn(this);
                    break;
                case "=": case "==":
                    if (value == text) return block.fn(this);
                    break;
                case ">=": case "=>": case "==>": case ">==":
                    if (value >= text) return block.fn(this);
                    break;
                case "<=": case "=<": case "==<": case "<==":
                    if (value <= text) return block.fn(this);
                    break;
                case ">":
                    if (value > text) return block.fn(this);
                    break;
                case "<":
                    if (value < text) return block.fn(this);
                    break;
                case "!=": case "<>":
                    if (value != text) return block.fn(this);
                    break;
                }
                return block.inverse(this);
            },
            container: function(classes, block) {
                var args = [].slice.call(arguments, 0, arguments.length-1);
                classes = [];
                block = arguments[arguments.length-1];
                for (var i = 0, l = args.length; i < l; i++) {
                    classes.push(args[i].toHTML ? args[i].toHTML() : args[i]);
                }
                var $container = $("<div>").addClass(classes.join(" "));
                $container.append(block.fn(this));
                return new Handlebars.SafeString($container[0].outerHTML);
            },
            preload: function(assets, context) {
                var args = [].slice.call(arguments, 0, arguments.length-1);
                var context = arguments[arguments.length-1];
                var path = context.data.root.path;
                for (var i = 0, l = args.length; i < l; i++) {
                    var src = args[i];
                    src = src.toHTML ? src.toHTML() : src;
                    if (src.substr(0,4) !== "http") {
                        var $a = $("<a>");
                        $a[0].href = path + "/assets/./" + src;
                        src = $a[0].href;
                    }
                    preloads[src] = true;
                }
                preloader.render();
            },
            img: function(src, classes, context) {
                var args = [].slice.call(arguments, 0, arguments.length-1);
                var context = arguments[arguments.length-1];
                var path = context.data.root.path;
                classes = [];
                for (var i = 1, l = args.length; i < l; i++) {
                    classes.push(args[i].toHTML ? args[i].toHTML() : args[i]);
                }
                
                src = src.toHTML ? src.toHTML() : src;
                if (src.substr(0,4) !== "http") {
                    var $a = $("<a>");
                    $a[0].href = path + "/assets/./" + src;
                    src = $a[0].href;
                }
                var $img = $("<img>").addClass(classes.join(" "));
                $img.attr("src", src );
                return new Handlebars.SafeString($img[0].outerHTML);
            },
            switch: function(subject, defaults, values, block) {
                var args = [].slice.call(arguments, 2, arguments.length-1);
                block = arguments[arguments.length-1];
                for (var i = 0, l = args.length; i < l; i+=2) {
                    if (subject == args[i]) {
                        return new Handlebars.SafeString(args[i+1]);
                    }
                }
                return new Handlebars.SafeString(defaults);
            },
            ifand: function(expressions, block) {
                var args = [].slice.call(arguments, 0, arguments.length-1);
                block = arguments[arguments.length-1];
                for (var i = 0, l = args.length; i < l; i++) {
                    if (!args[i]) return block.inverse(this);
                }
                return block.fn(this);
            },
            ifor: function(expressions, block) {
                var args = [].slice.call(arguments, 0, arguments.length-1);
                block = arguments[arguments.length-1];
                for (var i = 0, l = args.length; i < l; i++) {
                    if (args[i]) return block.fn(this);
                }
                return block.inverse(this);
            },
            pad: function(text, length, withText, context) {
                var minus = false;
                if (text < 0) {minus = true; text=Math.abs(text);}
                text = ""+(text||"");
                text = text.trim();
                var padLen = length - text.length;
                if (padLen) {
                    var posts = new Array(padLen+1);
                    var fences = posts.join(withText);
                    text = fences + text;
                }
                if (minus) {
                    text="-"+text.substr(1);
                }
                return text;
            }
            
        };

    for(var name in helpers) {
       if(helpers.hasOwnProperty(name)) {
             Handlebars.registerHelper(name, helpers[name]);
        }
    }
    return helpers;

});