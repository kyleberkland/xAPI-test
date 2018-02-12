define([
	'../sprite',
	'./audio/audioElement'
], function(Sprite, AudioElement) {

	var Audio = Sprite.extend({

		postInitialize: function() {
			this.model._allowBackgroundClick = true;
			this.model._static = true;
			this.model._startSeconds = 0;
		},

		postRender: function(isFirstRender) {
			if (!isFirstRender) return;

			var mediaOptions = _.extend(this.model, {
				_autoRewind: true
			});

			this.mediaView = new AudioElement({
				model: new Backbone.Model(mediaOptions)
			});

			this.mediaView.on("play", _.bind(this.onMediaPlay, this));
			this.mediaView.on("pause", _.bind(this.onMediaPause, this));
			this.mediaView.on("finish", _.bind(this.onMediaFinish, this));

			this.$(".media").append(this.mediaView.$el);

			this.parent.stateChanged();

		},

		events: {},

		stopPropagation: function(e)  {
			e.stopPropagation();
			e.preventDefault();
		},

		onMediaPlay: function() {
			this.model.isPlaying = true,
			this.model.hidden = false
			this.render();
			this.parent.stateChanged();
		},

		onMediaPause: function() {
			this.model.isPlaying = false,
			this.model.hidden = false
			this.render();
			this.parent.stateChanged();
		},
		
		onMediaFinish: function() {
			this.model.isPlaying = false,
			this.model.hidden = false
			this.render();
			this.parent.stateChanged();
			this.triggerRule(this.model._onFinishRule);
		},

        remove: function() {
        	if (this.isRemoved) return;
        	if (!this.mediaView) return;

        	for (var i = 0, l = this.controllers.length; i < l; i++) {
                var controller = this.controllers[i];
                controller.mediaVolumeDown(this.mediaView);
            }

        	Sprite.prototype.remove.apply(this, arguments);
        },

        detach: function() {
        	if (!this.mediaView) return;
        	this.mediaView.remove();
        	Sprite.prototype.detach.apply(this, arguments);
        },

        play: function(seekTo) {
        	if (!this.mediaView) return;
        	this.model.isPlaying = true,
			this.model.hidden = false
			this.render();
			this.mediaView.setVolume(1);
        	this.mediaView.play(seekTo);
        	this.parent.stateChanged();
        },

        pause: function() {
        	if (!this.mediaView) return;
        	if (!this.model.isPlaying) return;
        	this.model.isPlaying = false,
			this.model.hidden = false
			this.render();
        	this.mediaView.pause();
        	this.parent.stateChanged();
        },

        getState: function() {
        	return {
        		paused: this.mediaView && this.mediaView.videoElement ? this.mediaView.videoElement.paused : true
        	};
        },

        reset: function() {
        	//this.pause();
        },

        preload: function() {
        	// if (!this.mediaView) return;
        	// this.listenToOnce(this.mediaView, "preloaded", function() {
        	// 	this.trigger("preloaded")
        	// }, this);
        	// this.mediaView.preload();
        	// return true;
        },

        manualPreload: function() {
        	if (!this.mediaView) return;
        	this.listenToOnce(this.mediaView, "preloaded", function() {
        		this.trigger("preloaded")
        	}, this);
        	this.mediaView.preload();
        	return true;
        }

	}, {

		spriteName: "audio",
		template: "sprite-audio",

		setup: function(options, sprite) {
			var path = options.path;
 
			sprite.controls = false;
			sprite.features = [];
			if (!sprite._endOnClose && 
				!sprite._endOnFinish) {
				sprite._endOnClose = true;
			}

			sprite._media = sprite._media || {};

			if (sprite._audio) {
				sprite._media.mp3 = sprite._audio;
			}

			for (var k in sprite._media) {
	            if (sprite._media[k].substr(0, path.length) === path ) continue;
	            sprite._media[k] = path + "/assets/" + sprite._media[k];
	        }

		}

	});


	Sprite.loaded(Audio);

	return Audio;

});