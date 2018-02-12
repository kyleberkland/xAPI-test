define([
    "../controller",
    "./sprites/spritesState",
    "./sprites/spritesPreload"
], function(Controller) {

	var SpriteController = Controller.extend({

		postInitialize: function(options) {
			this.state.set("liveSprites", {});
			this.state.set("prestartedSprites", {});
		},

		setup: function() {
			this.setupControls();
			this.setupStaticSprites();
			_.defer(_.bind(function() {
				this._isReady = true;
				this.trigger("ready");
			}, this));
		},

		setupControls: function() {
			var liveSprites = this.state.get("liveSprites");

            var playPause = new InteractiveVideo.spriteStore['sprite:playpause']({
                parent: this,
                interactivevideo: this.interactivevideo,
                controllerUid: this.uid,
                track: {},
                index: 0,
                model: {},
                path: this.model.get("_path"),
                config: this.model.get("_config")
            });

            liveSprites['playPause'] = playPause;
            this.statics.push(playPause);
            this.$(".sprites-container-statics").append(playPause.$el);
            playPause.preStart();

            if (this.model.get("_config")._allowFullScreen) {

	            var fullscreen = new InteractiveVideo.spriteStore['sprite:fullscreen']({
	                parent: this,
	                interactivevideo: this.interactivevideo,
	                controllerUid: this.uid,
	                track: {},
	                index: 0,
	                model: {},
	                path: this.model.get("_path"),
	                config: this.model.get("_config")
	            });

	            liveSprites['fullscreen'] = fullscreen;
	            this.statics.push(fullscreen);
	            this.$(".sprites-container-statics").append(fullscreen.$el);
	            fullscreen.preStart();

	        }

        },

        setupStaticSprites: function() {
            var liveSprites = this.state.get("liveSprites");
            for (var i = 0, l = this.sprites.length; i < l; i++) {
                var sprite = this.sprites[i];
                if (!sprite._static) continue;

                var spriteView = new InteractiveVideo.spriteStore[sprite._type.toLowerCase()]({
                    parent: this,
                    interactivevideo: this.interactivevideo,
                    controllerUid: this.uid,
                    track: _.findWhere(this.tracks, {_id: sprite.trackId}),
                    index: 0,
                    model: sprite,
                    path: this.model.get("_path"),
                    config: this.model.get("_config")
                });

                this.statics.push(spriteView);
                liveSprites[sprite._id] = spriteView;

                spriteView.preStart();

                this.$(".sprites-container-statics").append(spriteView.$el);
            }
        },

		spritesCheck: function(track) {

			var sprites = track._sprites;
			if (!track._sprites) return;
			
			for (var i = 0, l = sprites.length; i < l; i++) {
				var sprite = sprites[i];
				sprite._index = i;

				if (this.isSpriteLive(track, sprite)) {
					this.checkEndLiveSprite(track, sprite)
					if (this.isSpriteLive(track, sprite)) {
						this.trackSecondsLiveSprite(track, sprite);
						continue;
					}
				}

				if (this.isSpritePreloaded(track, sprite)) {
					this.checkEndLiveSprite(track, sprite)
					if (!this.isSpritePreloaded(track, sprite)) continue;
				}
				
				var hasEnded = this.hasSpriteEnded(track, sprite);
				if (hasEnded) continue;

				if (this.shouldSpritePreload(track, sprite, 3)) {

					for (var i = 0, l = this.controllers.length; i < l; i++) {
						var controller = this.controllers[i];
						controller.spritePreload(track, sprite);
					}

					this.prestartSprite(track, sprite);

					sprite._hasPreloaded = true;
				}

				if (this.shouldSpriteStart(track, sprite, 2)) {

					this.prestartSprite(track, sprite);

					for (var i = 0, l = this.controllers.length; i < l; i++) {
						var controller = this.controllers[i];
						controller.spritePrestart(track, sprite);
					}

					this.startSprite(track, sprite);
				}

			}

		},

		isSpriteLive: function(track, sprite) {
			var liveSprites = this.state.get("liveSprites");
			return liveSprites[sprite._id] !== undefined;
		},

		isSpritePreloaded: function(track, sprite) {
			var prestartedSprites = this.state.get("prestartedSprites");
			return prestartedSprites[sprite._id] !== undefined;
		},

		checkEndLiveSprite: function(track, sprite) {
			var liveSprites = this.state.get("liveSprites");
			var prestartedSprites = this.state.get("prestartedSprites");

			var liveSprite = liveSprites[sprite._id] || prestartedSprites[sprite._id];

			var hasEnded = this.hasSpriteEnded(track, sprite) || this.hasSpriteTimeNotStarted(track, sprite);
			if (!hasEnded && !liveSprite.isRemoved && !liveSprite.isRemoving) return;
			
			this.removeLiveSprite(sprite);

			return true;
	
		},

		checkEndPrestartedSprite: function(track, sprite) {
			var prestartedSprites = this.state.get("prestartedSprites");

			var prestartedSprite = prestartedSprites[sprite._id];

			var hasEnded = this.hasSpriteEnded(track, sprite);
			if (!hasEnded && !prestartedSprite.isRemoved && !prestartedSprite.isRemoving) return;
			
			this.removePrestartedSprite(sprite);

			return true;
	
		},

		removeLiveSprite: function(sprite) {
			var liveSprites = this.state.get("liveSprites");
			var prestartedSprites = this.state.get("prestartedSprites");

			var liveSprite = liveSprites[sprite._id] || prestartedSprites[sprite._id];
			if (liveSprite) {
				if (!sprite.resetOnEnd) {
					sprite._isEnded = true;
				}
				liveSprite.isModal = false;
				delete liveSprites[sprite._id];
				delete prestartedSprites[sprite._id];
				liveSprite.remove();
			}
		},

		removePrestartedSprite: function(sprite) {
			var prestartedSprites = this.state.get("prestartedSprites");

			var prestartedSprite = prestartedSprites[sprite._id];
			if (prestartedSprite) {
				if (!sprite.resetOnEnd) {
					sprite._isEnded = true;
				}
				prestartedSprite.isModal = false;
				delete prestartedSprites[sprite._id];
				prestartedSprite.remove();
			}
		},

		hasSpriteEnded: function(track, sprite) {
			if (sprite._isEnded) return true;

			var isTimeEnded = this.hasSpriteTimeEnded(track, sprite);
			var isRuleEnded = this.hasSpriteRuleEnded(track, sprite);

			var isEnded = (isTimeEnded || isRuleEnded);

			if (!sprite.resetOnEnd) {
				sprite._isEnded = isEnded;
			} else {
				sprite._isEnded = false;
			}

			return isEnded;
		},

		trackSecondsLiveSprite: function(track, sprite) {
			var liveSprites = this.state.get("liveSprites");
			var prestartedSprites = this.state.get("prestartedSprites");

			var liveSprite = liveSprites[sprite._id] || prestartedSprites[sprite._id];

			liveSprite.trackSeconds();
		},

		hasSpriteTimeEnded: function(track, sprite) {
			var trackHasTime = track.__hasTimeline;
			var hasEndSeconds = (trackHasTime && sprite._endSeconds !== undefined);
			var isOverdue = (parseFloat(sprite._endSeconds) <= track.__seconds);

			//sprite with end time
			if (hasEndSeconds && isOverdue) {
				return true;
			}

			return false;
			

		},

		hasSpriteTimeNotStarted: function(track, sprite) {
			var trackHasTime = track.__hasTimeline;

			var hasStartSeconds = (trackHasTime && sprite._startSeconds !== undefined);
			var isUnderDue = (track.__seconds < parseFloat(sprite._startSeconds) - 3);

			if (hasStartSeconds && isUnderDue) {
				console.log("underdone", sprite._id, sprite._name);
				return true;
			}
				
			return false;

		},

		hasSpriteRuleEnded: function(track, sprite) {
			if (!sprite.endRule) return false;

			var endRule = {
				rule: sprite.endRule,
				result: false
			};

			for (var i = 0, l = this.controllers.length; i < l; i++) {
				var controller = this.controllers[i];
				controller.ruleExecute(track, sprite, null, endRule);
			}

			return endRule.result;
		},

		shouldSpritePreload: function(track, sprite, offsetSeconds) {
			if (sprite._hasPreloaded || sprite._isEnded) return false;

			var trackHasTime = track.__hasTimeline;

			var hasStartSeconds = (sprite._startSeconds !== undefined);
			var isOverdue = (parseFloat(sprite._startSeconds) <= track.__seconds+offsetSeconds);

			if (trackHasTime && hasStartSeconds && !isOverdue) return false;

			return true;
		},

		shouldSpriteStart: function(track, sprite, offsetSeconds) {
			var trackHasTime = track.__hasTimeline;

			var hasStartSeconds = (sprite._startSeconds !== undefined);
			var isOverdue = (parseFloat(sprite._startSeconds) <= track.__seconds+offsetSeconds);

			var hasSpriteRuleStart = this.hasSpriteRuleStart(track, sprite);

			if (trackHasTime && hasStartSeconds && !isOverdue) return false;
			if (!hasSpriteRuleStart) return false;

			return true;
		},

		hasSpriteRuleStart: function (track, sprite) {
			if (!sprite._startCondition) return true;

			var startRule = {
				rule: sprite._startCondition,
				result: true
			};

			for (var i = 0, l = this.controllers.length; i < l; i++) {
				var controller = this.controllers[i];
				controller.ruleExecute(track, sprite, null, startRule);
			}
			
			return startRule.result;
		},

		prestartSprite: function(track, sprite, isModal) {
			var prestartedSprites = this.state.get("prestartedSprites");
			//time to start the sprite
			//if (!this.prestartedSprites) this.prestartedSprites = {};
			//else 
			if (prestartedSprites[sprite._id]) {
				return prestartedSprites[sprite._id];
			}

			if (sprite._restoreEndSeconds !== undefined) {
	            sprite._endSeconds = sprite._restoreEndSeconds;
	            delete sprite._restoreEndSeconds;
	        } 

			var SpriteClass = InteractiveVideo.spriteStore[sprite._type.toLowerCase()];
			var spriteView = new SpriteClass({
				parent: this,
				interactivevideo: this.interactivevideo,
				controllerUid: this.uid,
				track: track,
				index: sprite._index,
				model: sprite,
				path: this.model.get("_path"),
				config: this.model.get("_config"),
				isModal: isModal || false
			});

			if (sprite.useStaticContainer) {
				this.$(".sprites-container-statics").append(spriteView.$el);
			} else {
				this.$(".sprites-container-inner").append(spriteView.$el);
			}

			prestartedSprites[sprite._id] = spriteView;
			return spriteView;
		},

		startSprite: function(track, sprite) {

			var liveSprites = this.state.get("liveSprites");
			var prestartedSprites = this.state.get("prestartedSprites");

			var spriteView = prestartedSprites[sprite._id];
			if (!spriteView) {
				spriteView = this.prestartSprite(track, sprite);
			}

			var shouldStartNow = (sprite._startSeconds <= track.__seconds);

			if (sprite._hasStarted) {
				if (!sprite.startTrigger) return;
				if (shouldStartNow) {
					sprite.startTrigger();
					sprite.startTrigger = undefined;
					return;
				}
			}

			sprite.startTrigger = _.bind(function() {

				var currentTrackIndex = this.model.get("_currentTrackIndex");
				if (this.state.get("isContinueLocked") || sprite._startSeconds > track.__seconds && this.trackViews[currentTrackIndex].isPaused && this.trackViews[currentTrackIndex].isPaused()) {
					//don't start if main video has paused and the sprite still shouldn't be loaded
					sprite._hasStarted = false;
					return;
				}

				delete prestartedSprites[sprite._id];

				liveSprites[sprite._id] = spriteView;

				this.performPauseBeforeSprite(track, sprite);
				
				spriteView.preStart();

				sprite._hasStarted = false;
				//sprite.isVisited = true;
				
			}, this);


			sprite._hasStarted = true;

			if (!shouldStartNow) {
				return;
			}
			
			sprite.startTrigger();
			sprite.startTrigger = undefined;
		},

		performPauseBeforeSprite: function(track, sprite) {
			if (!sprite._pauseOnStart) return;

			this.trackViews[track._index].pause();
			this.state.set("isContinueLocked", true);
			this.stateChanged();
		},

		trackContinue: function() {
			this.state.set({
				"isContinueLocked": false,
				"isPlaying": true
			});
			this.stateChanged();
		},

		trackChanged: function(toTrack, fromTrack, atSeconds) {
			this.trackContinue();
			this.checkLiveSpritesEndOnTrackChange(fromTrack);
			this.checkPrestartedSpritesEndOnTrackChange(fromTrack);
			this.resetSpritesAfterSeconds(toTrack, atSeconds);
		},

		trackGoto: function(toId, toSeconds, fromTrack, fromSprite) {
			if (fromSprite) fromSprite._hasMoved = true;
			this.state.set("isContinueLocked", false);
		},

		checkLiveSpritesEndOnTrackChange: function(track) {
			var liveSprites = this.state.get("liveSprites");

			for (var k in liveSprites) {

				var liveSprite = liveSprites[k];
				if (liveSprite.model && track && !liveSprite.model._static && liveSprite.model.trackId != track._id) {
					continue;
				}
				if (liveSprite.model._static) {
					liveSprite.reset();
					continue;
				} else {
					if (liveSprite.model._endOnTrackChange) {
						liveSprite.model._isEnded = true;
					}
				}

				this.checkEndLiveSprite(liveSprite.track, liveSprite.model);
			}
		},

		checkPrestartedSpritesEndOnTrackChange: function(track) {
			var prestartedSprites = this.state.get("prestartedSprites");

			for (var k in prestartedSprites) {

				var prestartedSprite = prestartedSprites[k];
				if (prestartedSprite.model && track && !prestartedSprite.model._static && prestartedSprite.model.trackId != track._id) {
					continue;
				}
				if (prestartedSprite.model._static) {
					prestartedSprite.reset();
					continue;
				} else {
					if (prestartedSprite.model._endOnTrackChange) {
						prestartedSprite.model._isEnded = true;
					}
				}

				this.checkEndPrestartedSprite(prestartedSprite.track, prestartedSprite.model);
			}
		},

		resetSpritesAfterSeconds: function(track, seconds) {
			if (!track._sprites) return;

			var liveSprites = this.state.get("liveSprites");

			for (var i = 0, l = track._sprites.length; i < l; i++) {
				var sprite = track._sprites[i];
				if (sprite._startSeconds === undefined || sprite._startSeconds === null) continue;
				var startSeconds = parseFloat(sprite._startSeconds);
				if (startSeconds < seconds) continue;

				if (!sprite._static) {
					if (liveSprites[sprite._id]) {
						this.removeLiveSprite(sprite);
					}
				}
				track._sprites[i]._isEnded = null;
				track._sprites[i]._hasPreloaded = null;

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
        }
		
	});

	Controller.loaded(SpriteController);

	return SpriteController;

});
