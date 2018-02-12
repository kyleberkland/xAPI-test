define([
	'./utils/diffView',
    "./global"
], function(DiffView) {

	var spriteUid = 0;


	var Sprite = DiffView.extend({

		_shouldShow: false,

		initialize: function(options) {
			this.spriteUid = spriteUid++;
			this.controllerUid = options.controllerUid;
			this._index = options._index;
			this.track = options.track;
			this.path = options.path;
			this.config = options.confg;
			this.parent = options.parent;
			this.interactivevideo = options.interactivevideo;
			this.controllers = options.parent.controllers;
			this.isModal = options.isModal || false;

			this.$el.addClass(this.constructor.template.toLowerCase()).addClass("sprite").addClass(this.model._className).addClass("anim-in");

			this.model.path = options.path;

			this.model.tracks = this.parent.tracks.byId;
			this.model.sprites = this.parent.sprites.byId;
			this.model.items = this.parent.items.byId;

			if (this.model._id) {
				this.$el.addClass("sprite-"+this.model._id.replace(/[:]/g,"-"));
			}

			if (this.model._cssStyle && this.model._cssStyle.trim()) {
				var css = this.constructor.parseStyle(this.model._cssStyle);
				this.$el.css(css);
			}

			DiffView.prototype.initialize.apply(this, arguments);

			this.once("postRender", function() {
				if (this._shouldShow) {
					if (this.model._noAnimateIn) {
						this.$el.removeClass("anim-in").addClass("anim noanim");
					} else {
						this.$el.addClass("anim").removeClass("anim-in");
					}
				}
			});

			this.state = this.parent.state;
		},

		preStart: function() {
			if (this.hasStarted) return;
			if (this.isRemoved) return;
			if (this.isRemoving) return;
			if (this.hasRendered) {
				if (this.model._noAnimateIn) {
					this.$el.removeClass("anim-in").addClass("anim noanim");
				} else {
					this.$el.addClass("anim").removeClass("anim-in");
				}
			}
			this._shouldShow = true;

			_.delay(_.bind(function() {
				this.triggerRule(this.model._onStartRule);
			},this), 50);

			this.hasStarted = true;
			this.start();

			_.delay(_.bind(function() {
				this.hasAnimatedIn = true;
			},this), 700);
		},

		backgroundClick: function(e) {
			if (!this.hasStarted) return;
			if (this.isRemoved) return;
			if (this.isRemoving) return;
			if (this.allowBackgroundClick()) return;

			this.onBackgroundClick(e);
		},

		//override
		onBackgroundClick: function(e) {
			e.stopPropagation();
		},

		//override
		start: function() {},

		allowInteractions: function() {
			if (!this.hasStarted) return false;
			if (!this.hasAnimatedIn) return false;
			if (this.isRemoved) return false;
			if (this.isRemoving) return false;
			return true;
		},

		allowBackgroundClick: function() {
			if (this.isRemoved || this.isRemoving || !this.hasStarted) return true;
			return this.model._allowBackgroundClick;
		},

		setEnded: function() {
			if (!this.hasStarted) return;
			if (this.isRemoved) return;
			if (this.isRemoving) return;
			if (this.isModel) return;
			this.model._isEnded = true;
		},

		triggerContinue: function() {
			if (!this.hasStarted) return;
			if (this.isRemoved) return;
			if (this.isRemoving) return;
			if (this.isModal) return;

			//only allow continue to fire if sprite caused _pauseOnStart
			if (!this.model._pauseOnStart) return;

			for (var i = 0, l = this.controllers.length; i < l; i++) {
				var controller = this.controllers[i];
				controller.trackContinue(this.track, this.model);
			}
		},


		triggerFullScreen: function() {
			if (!this.hasStarted) return;
			if (this.isRemoved) return;
			if (this.isRemoving) return;

			for (var i = 0, l = this.controllers.length; i < l; i++) {
				var controller = this.controllers[i];
				controller.fullScreenToggle();
			}
		},

		triggerPause: function() {
			if (!this.hasStarted) return;
			if (this.isRemoved) return;
			if (this.isRemoving) return;

			for (var i = 0, l = this.controllers.length; i < l; i++) {
				var controller = this.controllers[i];
				controller.globalPause();
			}
		},

		triggerPlay: function() {
			if (!this.hasStarted) return;
			if (this.isRemoved) return;
			if (this.isRemoving) return;

			for (var i = 0, l = this.controllers.length; i < l; i++) {
				var controller = this.controllers[i];
				controller.globalPlay();
			}
		},

		triggerRule: function(expression, item) {
			if (!this.hasStarted) return;
			if (this.isRemoved) return;
			if (this.isRemoving) return;
			if (!expression) return;
			var ruleObject = {
				rule: expression
			};

			for (var i = 0, l = this.controllers.length; i < l; i++) {
				var controller = this.controllers[i];
				controller.ruleExecute(this.track, this.model, item, ruleObject);
			}
		},

		reset: function() {
			//reset static sprites rather than remove;
		},

		remove: function(delayTime) {
			if (this.isRemoved) return;
			if (this.isRemoving) return;
			if (this.isModal) {
				var liveSprites = this.parent.state.get("liveSprites");
        		var prestartedSprites = this.parent.state.get("prestartedSprites");

        		var id = this.model._id;

        		delete liveSprites[id];
        		prestartedSprites[id] = this;
        		
				this.triggerRule(this.model._onEndRule);

        		this.hasStarted = false;
        		this.hasAnimatedIn = false;
        		this.hasStarted = false;
        		this._isModal = false;

        		this.$el.addClass("anim-in").removeClass("anim noanim");

				return;
			}

			this.triggerRule(this.model._onEndRule);
			this.isRemoving = true;
			this.trigger("removed");
			this.$el.addClass("anim-out").removeClass("anim noanim");
			this.stopListening();
			this.undelegateEvents();
			this.finish();
			_.delay(_.bind(function() {
				this.removed();
				this.spriteUid = undefined;
				this.controllerUid = undefined;
				this._index = undefined;
				this.path = undefined;
				this.config = undefined;
				this.parent = undefined;
				DiffView.prototype.remove.apply(this, arguments);
			}, this), delayTime || 3000);
		},

		//override
		preload: function() {},
		
		finish: function() {},

		removed: function() {},

		getState: function() {},

		stateChange: function() {},

		scoreInitialize: function() {},

		scoreChange: function() {},

		trackSeconds: function() {},

		flagInitialize: function() {},

		fullScreenIn: function() {},

		fullScreenOut: function() {},

	}, {
		spriteName: "undefined",
		template: "sprite-undefined",

		loaded: function(SpritePrototype) {
			InteractiveVideo.on("register", SpritePrototype.register, SpritePrototype);
		},

		register: function() {
			InteractiveVideo.register("sprite", "sprite:"+this.spriteName.toLowerCase(), this);
		},

		setup: function(options, sprite) {},

		preloadImages: function(returnSrcArray, sprite) {},

		reset: function(sprite) {},

		parseStyle: function(style) {
			var output = {};
			var matches = style.match(css_props_re);
			if (!matches) return output;
			matches = _.filter(matches, function(item) { return item; });
			for (var i = 0, l = matches.length; i < l; i++) {
				var match = matches[i];
				var cssName = match.match(css_propname_re)[0];
				var cssValue = (match.substr(cssName.length+1)).trim()
				cssName = (cssName).trim();
				output[cssName] = cssValue;
			}
			return output;
		}

	});

	var css_props_re = /[^;]*/g;
	var css_propname_re = /[^:]*/;

	return Sprite;

});