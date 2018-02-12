define([
	'../sprite',
	'../tracks/iPhoneVideoElement',
	'../tracks/videoElement'
], function(Sprite, IPhoneVideoElement, VideoElement) {

	var SubVideo = Sprite.extend({

		postInitialize: function() {
			this.model._endOnTrackChange = true;
		},

		postRender: function(isFirstRender) {
			if (!isFirstRender) return;

			var mediaOptions = _.extend(this.model, {
				_autoRewind: true,
				_alwaysShowControls: true,
				_useClosedCaptions: true
			});

			if ($.fn.inlinevideo.isiPhone && $.fn.inlinevideo.version < 10) {
				this.mediaView = new IPhoneVideoElement({
					model: new Backbone.Model(mediaOptions),
                    interactivevideo: this.interactivevideo
				});
			} else {
				this.mediaView = new VideoElement({
					model: new Backbone.Model(mediaOptions),
                    interactivevideo: this.interactivevideo
				});
			}

			this.mediaView.on("play", _.bind(this.onMediaPlay, this));
			this.mediaView.on("pause", _.bind(this.onMediaPause, this));
			this.mediaView.on("finish", _.bind(this.onMediaFinish, this));

			this.$(".media").append(this.mediaView.$el);

			this.parent.stateChanged();
		},

		events: {
			"click": "stopPropagation",
			"click .play-button": "onClick",
			"click .overlay": "onClick",
			"click video": "onClick",
			"click .close-button": "onCloseClick"
		},

		stateChange: function() {
			this.render();
		},

		scoreChange: function() {
			this.render();
		},

		stopPropagation: function(e)  {
			e.stopPropagation();
			e.preventDefault();
		},

		onBackgroundClick: function(e) {
			e.stopPropagation();
			if (this.model._endOnClose) this.onCloseClick();
		},

		onClick: function(e) {
			if (!this.allowInteractions()) return;

			e.preventDefault();
			e.stopPropagation();
			if (this.mediaView.isPaused()) {
				if ($(e.currentTarget).is(".overlay")) return;

				this.model.isPlaying = true,
				this.mediaView.play();
				this.waitAnimateOut(this.model, function() {
					if (this.model.isPlaying) {
						this.model.hidden = true;
					} else {
						this.model.hidden = false;
					}
					this.render();
				}, this);
			} else {
				this.model.isPlaying = false;
				this.model.hidden = false
				this.render();
				this.mediaView.pause();
			}
		},

		onCloseClick: function() {
			if (!this.allowInteractions()) return;

			this.mediaView.pause();
			try {
			    window.stop();
			} catch (exception) {
			    document.execCommand('Stop');
			}
			if (!this.model._endOnClose) this.setEnded();
			this.triggerRule(this.model._onCloseRule);
			this.triggerContinue()
			this.remove();
		},

		onMediaPlay: function() {
			this.model.isPlaying = true,
			this.model.hidden = false
			this.render();
			this.parent.stateChanged();
			this.triggerRule(this.model._onPlayRule);
		},

		onMediaPause: function() {
			this.model.isPlaying = false,
			this.model.hidden = false
			this.render();
			this.parent.stateChanged();
		},
		
		onMediaFinish: function() {
			if (this.model._endOnFinish) {
				this.setEnded();
				this.triggerContinue()
				this.remove();
				return;
			}

			this.model.isPlaying = false,
			this.model.hidden = false
			this.render();
			this.parent.stateChanged();
			this.triggerRule(this.model._onFinishRule);
		},

		waitAnimateOut: function(sprite, callback, context) {
			var animateOutDuration = this.disableAnimations ? 0 : 1000;
			_.delay(_.bind(callback, context), animateOutDuration);
		},

        remove: function() {
        	if (this.isRemoved) return;

        	if (this.mediaView) {
	        	for (var i = 0, l = this.controllers.length; i < l; i++) {
	                var controller = this.controllers[i];
	                controller.mediaVolumeDown(this.mediaView);
	            }
	        }

        	Sprite.prototype.remove.apply(this, arguments);
        },

        removed: function() {
        	this.mediaView.pause();
        	this.mediaView.remove();
        	Sprite.prototype.removed.apply(this, arguments);
        },

        play: function(seekTo) {
        	if (this.mediaView) {
        		this.mediaView.play(seekTo);	
        	} else {
        		_.defer(_.bind(function() {
        			this.mediaView.play(seekTo);	
        		}, this));
        	}
        	
        },

        pause: function() {
        	this.mediaView.pause();
        },

        getState: function() {
        	return {
        		paused: this.mediaView && this.mediaView.videoElement ? this.mediaView.videoElement.paused : true
        	};
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

		spriteName: "subVideo",
		template: "sprite-subVideo",

		setup: function(options, sprite) {
			var path = options.path;

			sprite.controls = true;
			sprite.features = ['playpause', 'progress','tracks'];
			if (!sprite._endOnClose && 
				!sprite._endOnFinish) {
				sprite._endOnClose = true;
			}

			sprite._media = sprite._media || {};

			if (sprite._video) {
				sprite._media.mp4 = sprite._video;
			}

			if (sprite._poster) {
				sprite._media.poster =  path + "/assets/" + sprite._poster;
			}

			for (var k in sprite._media) {
	            if (sprite._media[k].substr(0, path.length) === path ) continue;
	            sprite._media[k] = path + "/assets/" + sprite._media[k];             
	        }

	        if (sprite._subtitles) {
				sprite._media.cc = {
					src: path + "/assets/" + sprite._subtitles,
					srclang: sprite.cssLang || "en"
				};
			}

		},

		preloadImages: function(returnSrcArray, sprite) {

			if (sprite._media && sprite._media.poster) {
	            returnSrcArray.push(sprite._media.poster);
	        }

		}

	});


	Sprite.loaded(SubVideo);

	return SubVideo;

});