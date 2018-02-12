define([
	"../controller",
	"./tracks/preloadOnClick"
], function(Controller) {

	var TracksController = Controller.extend({

		ignoreSecondsChanging: false,
		hasPreloaded: false,
		preloadDefer: null,

		postInitialize: function() {
			this.preloadDefer = [];
		},

		preSetup: function() {
			this.setupTracks();
		},

		setupTracks: function() {
			this.tracks.ready = 0;

    		for (var i = 0, l = this.tracks.length; i < l; i++) {
    			var track = this.tracks[i];
                track.isActive = false;
    			track._index = i;


                var view;
                var ViewClass;

                switch (track._type) {
                case "track:image":
                	track._media = {
                		"still": track._graphic
                	};
                    ViewClass = InteractiveVideo.trackStore['still'];
                    break;
                case "track:video":
                	track._media = {
                		"mp4": track._video
                	};
                    if (track.alternateTimeline) {
                        ViewClass = InteractiveVideo.trackStore['still'];
                    } else if ($.fn.inlinevideo.isiPhone && $.fn.inlinevideo.version < 10) {
                        ViewClass = InteractiveVideo.trackStore['iPhoneVideoElement'];
                    } else {
                        ViewClass = InteractiveVideo.trackStore['videoElement'];
                    }
                    break;
                default:
                    throw "Unknown track type " + track._type;
                }

                this.setupTrack(track);

                track.__hasTimeline = true;
                track.__seconds = 0;

                view = new ViewClass({
                    parent: this,
                    interactivevideo: this.interactivevideo,
                    model: new Backbone.Model(track)
                });

                this.listenTo(view, {
                    "seconds": this.onTrackSecondsChange,
                    "ready": this.onTrackReady,
                    "play": this.onTrackPlay,
                    "pause": this.onTrackPause
                }, this);

                this.trackViews.push(view);
                this.$("#track-"+track._id).append(view.$el);

    		}
            
    	},

        setupTrack: function(track) {
            var path = this.model.get("_path");

            for (var k in track._media) {
                if (track._media[k].substr(0, path.length) === path ) continue;
                track._media[k] = path + "/assets/" + track._media[k];             
            }

            if (!track._sprites) return;
            for (var i = 0, l = track._sprites.length; i < l; i++) {
                var sprite = track._sprites[i];

                if (typeof sprite._startSeconds === "string" && sprite._startSeconds !== "") {
                    sprite._startSeconds = parseFloat(sprite._startSeconds);
                }
                if (typeof sprite._endSeconds === "string" && sprite._endSeconds !== "") {
                    sprite._endSeconds = parseFloat(sprite._endSeconds);
                }

                InteractiveVideo.spriteStore[sprite._type].setup( {path:path}, sprite );
            }
        },

        onTrackReady: function(track) {
            this.tracks.ready++;
            if (this.tracks.ready === this.tracks.length) {
                this.onTracksReady();
            }
        },

        onTracksReady: function() {            
            this._isReady = true;
            this.trigger("ready");

            _.delay(_.bind(function() {
                this.$el.addClass("allow-animations");
            }, this), 250);
        },

        onTrackSecondsChange: function(trackView, seconds) {
          	//console.log("ping isPlaying", this.state.get("isPlaying"));
            for (var i = 0, l = this.controllers.length; i < l; i++) {
                var controller = this.controllers[i];
                controller.trackSeconds(trackView, seconds);
            }

    	},

    	onTrackPlay: function(trackView) {
			var currentTrackIndex = this.model.get("_currentTrackIndex")
    		if (this.trackViews[currentTrackIndex].cid != trackView.cid) return;

			//console.log("on track play");
			this.state.set({"isPlaying": true});
    	},
		
    	onTrackPause: function(trackView) {
    		var currentTrackIndex = this.model.get("_currentTrackIndex")
    		if (this.trackViews[currentTrackIndex].cid != trackView.cid) return;

    		//console.log("on track paused");
			this.state.set({"isPlaying": false});
    	},
		
		ready: function() {
			this.resize();
			this.gotoStartTrack();
		},	

		gotoStartTrack: function() {
			var startIndex = 0;
			var startTrackId = this.model.get("_config")._startTrack;
			var startSeconds = 0;

			var restored = this.model.get("_start");
			if (restored) {
				startTrackId = restored.t;
				startSeconds = restored.z;
			}

			var track = this.getTrackFromId(startTrackId);
			if (track) startIndex = track._index;

			this.setCurrentActiveTrackByIndex(startIndex, startSeconds);

			if (track._autoPlay) {
				var trackView = this.trackViews[startIndex];
				trackView.play();
			}
		},

		setCurrentActiveTrackByIndex: function(index, toSeconds) {
			var previousIndex = this.model.get("_currentTrackIndex");
			var previousTrack = null;
			if (previousIndex != undefined) {
				previousTrack = this.tracks[previousIndex];
			}

			this.model.set("_currentTrackIndex", index);
			this.state.set("_currentTrackId", this.tracks[index]._id);
			this.$el.attr("iv-track", this.tracks[index]._id);
			for (var i = 0, l = this.tracks.length; i < l; i++) {
				this.tracks[i].isActive = false;
				this.trackViews[i].active(false);
			}

			this.tracks[index].isActive = true;
			this.trackViews[index].active(true);


			this.state.set("trackClassName", this.tracks[index]._className);

			//console.log("set current active track by index");
			this.state.set({
				"isPlaying": true,
				"hidden": true
			});
			
			var track = this.tracks[index];

			for (var i = 0, l = this.controllers.length; i < l; i++) {
				var controller = this.controllers[i];
				controller.trackChanged(track, previousTrack, toSeconds);
				controller.trackSeconds(this.trackViews[index], toSeconds);
			}

			this.checkSprites(track);
		},

		preloaded: function() {
			this.hasPreloaded = true;
			this.state.set("isTrackLoading", false);
			for (var i = 0, l = this.preloadDefer.length; i < l; i++) {
				var preloadDefer = this.preloadDefer[i];
				preloadDefer.func.apply(this, preloadDefer.args);
			}

		},

		trackGoto: function(toId, toSeconds, fromTrack, fromSprite, toPaused) {
			//console.log("trackGoto", toId, toSeconds);

			this.state.set("isTrackLoading", true);
			var toTrack = this.getTrackFromId(toId);
			var toTrackView = this.trackViews[toTrack._index];
			toTrackView._keepingPreloadPlaying = false;

			for (var i = 0, l = this.controllers.length; i < l; i++) {
				var controller = this.controllers[i];
				controller.mediaPreload(toTrack, toSeconds, toPaused);
			}

			//if (!this.hasPreloaded) {
			if (!toTrackView.hasPreloaded) {
				//console.log("trackGoto preload defer");
				this.preloadDefer.push({
					func: this.trackGoto,
					args: arguments
				});
				return;
			}

			if (fromTrack && fromSprite) {
				var currentTrackIndex = this.model.get("_currentTrackIndex");
				var currentTrack = this.tracks[currentTrackIndex];
				this.performPauseAfterSprite(currentTrack, fromSprite); 
				//(fromTrack, fromSprite); //if triggering goto from sprite on another track then this won't work
				var fromTrackView = this.trackViews[fromTrack._index];
				fromTrackView.debrief();
			}

			toTrackView.prepare();

			if (fromSprite) {
				var animateOutDuration = this.disableAnimations ? 0: 250;
				_.delay(_.bind(function() {
					this.onReadyToPlay(toTrackView, toTrack, toSeconds, toPaused);
				}, this), animateOutDuration);
			} else {
				this.onReadyToPlay(toTrackView, toTrack, toSeconds, toPaused);
			}

		},

		onReadyToPlay: function(trackView, track, seconds, paused) {
			//console.log("onReadyToPlay", track._id, seconds, paused, trackView._isPreLoading);

			if (trackView._isPreLoading || !trackView._isPreLoaded) {
				_.delay(_.bind(function() {
					this.onReadyToPlay(trackView, track, seconds, paused);
				}, this), 250);
			}

			trackView._keepingPreloadPlaying = true;

			for (var i = 0, l = this.controllers.length; i < l; i++) {
				var controller = this.controllers[i];
				controller.trackPreplay(trackView);
			}

			var shouldNavigateToSeconds = (seconds !== undefined && seconds !== "");
			if (shouldNavigateToSeconds) {
				seconds = parseFloat(seconds);
				track.__seconds = seconds;
			} else {
				seconds = undefined;
			}

			this.ignoreSecondsChanging = true;
			this.awaitingActiveTrack = {
				track: track,
				seconds: seconds
			};
			
			if (!trackView._isPreLoading || trackView._isPreLoaded) {
				this.state.set("isTrackLoading", true);
				if (shouldNavigateToSeconds) {
					if (paused) {
						trackView.setCurrentSeconds(seconds);
					} else {
						trackView.play(seconds);
					}
				} else {
					if (paused) {
						trackView.setCurrentSeconds(seconds);
					} else {
						trackView.play();
					}
				}
			} else {
				console.log("error, track hasn't finished loading");
			}

			trackView.resize();
		},

		onPlayed: function(track, seconds) {
			//console.log("on played");
			this.awaitingActiveTrack = null;
			this.setCurrentActiveTrackByIndex(track._index, seconds || 0);
			this.state.set("isTrackLoading", false);
			this.state.set({"isPlaying": true});
			this.ignoreSecondsChanging = false;

		},

		performPauseAfterSprite: function(track, sprite) {
			if (!sprite._pauseAfter) return false;

			this.trackViews[track._index].pause();
			return true;
		},	

		getTrackFromId: function(id) {
			var tracks = this.tracks;
			id=""+id;
			return _.findWhere(tracks, {_id:id});
		},

		trackContinue: function(track, sprite) {
			var animateOutDuration = this.disableAnimations ? 0: 250;
			var trackView = this.trackViews[track._index];
			_.delay(_.bind(function() {

				this.checkSprites(track);
				
				for (var i = 0, l = this.controllers.length; i < l; i++) {
					var controller = this.controllers[i];
					controller.trackPreplay(trackView);
				}
				
				if (this.state.get("isContinueLocked")) {
					return;
				}
				if (!this.performPauseAfterSprite(track, sprite)) {
					trackView.play();
				}

			}, this), animateOutDuration);
		},

		trackSeconds: function(trackView, seconds) {
			if (this.awaitingActiveTrack) {
				var awaitingActiveTrack = this.awaitingActiveTrack;
				//delay a little for iPad
				//_.delay(_.bind(function() {
					this.onPlayed(awaitingActiveTrack.track, awaitingActiveTrack.seconds);
				//}, this), 50);
				return;
			}

			var currentTrackIndex = this.model.get("_currentTrackIndex")
    		if (this.trackViews[currentTrackIndex].cid != trackView.cid) return;

			var track = this.tracks[trackView.model.attributes._index];
			track.__seconds = seconds;
			
			this.checkSprites(track);
		},

		checkSprites: function(track) {
			for (var i = 0, l = this.controllers.length; i < l; i++) {
				var controller = this.controllers[i];
				controller.spritesCheck(track);
			}
		},

		stateChanged: function() {
			for (var i = 0, l = this.controllers.length; i < l; i++) {
                var controller = this.controllers[i];
                controller.stateChange();
            }
            
            for (var i = 0, l = this.trackViews.length; i < l; i++) {
                var trackView = this.trackViews[i];
                trackView.stateChange();
            }

            var liveSprites = this.state.get("liveSprites");
            for (var k in liveSprites) {
                liveSprites[k].stateChange();
            }
        },

	});

	Controller.loaded(TracksController);

	return TracksController;

});
