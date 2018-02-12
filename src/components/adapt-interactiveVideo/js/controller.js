define([
    "./global"
], function() {

	var Controller = Backbone.View.extend({

		parent: null,
		model: null,
		state: null,
		trackViews: null,
		tracks: null,
		uid: null,

		disableAnimations: false,

		initialize: function(options) {
			options || (options = {});
			this.state = options.state;
			this.parent = options.parent;
			this.controllers = this.parent.controllers;
			this.interactivevideo = options.interactivevideo;
			this.statics = this.parent.statics;
			this.trackViews = this.parent.trackViews;
			this.tracks = this.model.attributes._config._tracks;
			this.sprites = this.parent.sprites;
			this.items = this.parent.items;
			this.uid = this.state.get("uid");

			this.postInitialize(options);
			this.setUpEventListeners(options);
		},

		postInitialize: function() {},

		setUpEventListeners: function() {},

		preSetup: function() {},

		setup: function() {},

		postSetup: function() {
			_.defer(_.bind(function() {
				this._isReady = true;
				this.trigger("ready");
			}, this));
		},

		waitAnimateOut: function(sprite, callback, context) {
			var animateOutDuration = this.disableAnimations ? 0 : 250;
			_.delay(_.bind(callback, context), animateOutDuration);
		},

		resize: function() {},

		ready: function() {},

		preloaded: function() {},

		stateChange: function() {},

		trackPreplay: function() {},

		trackGoto: function(toId, toSeconds, fromTrack, fromSprite, toPaused) {},

		trackContinue: function(track, sprite) {},

		trackSeconds: function(trackView, seconds) {},

		trackChanged: function(toTrack, fromTrack, atSeconds) {},

		spritesCheck: function(track) {},

		spritePreload: function(track, sprite) {},

		spritePrestart: function(track, sprite) {},

		fullScreenToggle: function() {},

		mediaPreload: function(track, seconds, toPaused) {},

		mediaVolumeDown: function(media) {},

		mediaVolumeUp: function(media) {},

		globalPlay: function() {},

		globalPause: function() {},

		ruleExecute: function(track, sprite, item, ruleObject) {},

		savePosition: function(trackId, seconds) {},

		saveScore: function() {},

		saveReset: function() {},

		scoreInitialize: function() {},

		scoreChange: function() {},

		remove: function() {
			delete this.state;
			delete this.controllers;
			delete this.statics;
			delete this.parent;
			delete this.sprites;
			delete this.model;
			delete this.trackViews;
			delete this.tracks;
			delete this.$el;
			this.isRemoved = true;
		}

	}, {

		loaded: function(ControllerPrototype) {
            InteractiveVideo.on("register", ControllerPrototype.register, ControllerPrototype);
        },

		register: function() {
			InteractiveVideo.register("controller", this);
		}

	});

	return Controller;

});