define([
	'../sprite'
], function(Sprite) {

	var Scrub = Sprite.extend({

		isInDrag: false,
		wasPaused: false,

		postInitialize: function() {
			this.model._endOnTrackChange = true;

			this.onMouseUp = _.bind(this.onMouseUp, this);
			this.onMouseMove = _.bind(this.onMouseMove, this);

			$(document).on("mouseup", this.onMouseUp);
			$(document).on("touchend", this.onMouseUp);
			$(document).on("mousemove", this.onMouseMove);
			$(document).on("touchmove", this.onMouseMove);
			$(document).on("click", this.onMouseClick);

			this.setupMarkers();
		},

		setupMarkers: function() {
			var __ = this;
			var sprites = _.filter(this.parent.sprites, function(item) {
				var viable = item.trackId === __.model.trackId &&
					item._startSeconds !== undefined &&
					item._startSeconds >= __.model._startSeconds &&
					(item._endSeconds === undefined || (
						item._endSeconds <= __.model._endSeconds
					));

				if (!viable) return false;

				var classes = item._className && item._className.split(" ");
				if (!classes) return false;

				return _.indexOf(classes, "scrub") > -1;
			});

			this.model._sprites = [];

			var markSeconds = (this.model._endSeconds - this.model._startSeconds);

			for (var i = 0, l = sprites.length; i < l; i++) {

				var startSeconds = (sprites[i]._startSeconds - this.model._startSeconds);

				var left = Math.round((100 / markSeconds) * startSeconds);

				this.model._sprites.push({
					left: left+"%",
					isVisited: sprites[i].isVisited
				});
				
			}


		},

		events: {
			"click": "onClick",
			"click .play-pause button": "onPlayPause",
			"mousedown .outer": "onBarMouseDown",
			"touchstart .outer": "onBarMouseDown"
		},

		onClick: function(e) {
			e.preventDefault();
			e.stopPropagation();
		},

		onPlayPause: function(e) {
			e.preventDefault();
			e.stopPropagation();

			for (var i = 0, l = this.controllers.length; i < l; i++) {
				var controller = this.controllers[i];
				if (controller.onGlobalPlayPause) {
					controller.onGlobalPlayPause(e);
				}
			}

		},

		trackSeconds: function() {
			if (!this.allowInteractions()) return;
			
			if (this.isInDrag) return;

			var markSeconds = (this.model._endSeconds - this.model._startSeconds);
			var passedSeconds = (this.track.__seconds - this.model._startSeconds);

			//.$(".container")
			var barWidth = this.$(".outer").width();

			var width = (passedSeconds/markSeconds) * barWidth;

			this.model.width = width;
			this.render();
		},

		onBarMouseDown: function(e) {
			if (!this.allowInteractions()) return;

			e.stopPropagation();

			if (this.parent.state.get("isContinueLocked")) return;

			this.isInDrag = true;

			var currentTrackIndex = this.parent.model.get("_currentTrackIndex");
			this.wasPaused = this.parent.trackViews[currentTrackIndex].isPaused();

			if (!this.wasPaused) this.parent.trackViews[currentTrackIndex].pause();

			this.onMouseMove(e);
		},

		onMouseUp: function(e) {
			if (!this.allowInteractions()) return;

			if (!this.isInDrag) return;
			if (this.parent.state.get("isContinueLocked")) return;

			e.preventDefault();
			e.stopPropagation();

			_.defer(_.bind(function() {
				//defer to trap backgroundClicks that follow mouseup
				this.isInDrag = false;
				this.stopBackgroundClick = false;
			}, this));


			this.onBarClick(e);

			var currentTrackIndex = this.parent.model.get("_currentTrackIndex");
			if (!this.wasPaused) this.parent.trackViews[currentTrackIndex].play();
		},

		allowBackgroundClick: function() {
			if (this.stopBackgroundClick) {
				this.stopBackgroundClick = false;
				return false;
			}
			return this.model._allowBackgroundClick;
		},

		backgroundClick: function(e) {
			if (!this.isInDrag) return;

			//stop backgroundClick performing global play/pause if in drag
			e.preventDefault();
			e.stopPropagation();
		},

		onMouseMove: function(e) {
			if (!this.allowInteractions()) return;

			if (!this.isInDrag) return;

			this.stopBackgroundClick = true;

			//.$(".container")
			var position = this.$(".inner").offset();
			var clientX = e.clientX;
			switch (e.type) {
			case "touchstart":
			case "touchmove":
			case "touchend":
				if (e.originalEvent.changedTouches) {
					clientX = e.originalEvent.changedTouches[0].clientX;
				} else {
					clientX = e.originalEvent.layerX;
				}
			}

			//.$(".container")
			var leftPX = (clientX - position.left);
			if (leftPX < 0) leftPX = 0;
			var barWidth = this.$(".outer").width();

			var markSeconds = (this.model._endSeconds - this.model._startSeconds);

			var gotoSeconds = (leftPX/barWidth) * markSeconds;

			var width = (gotoSeconds/markSeconds) * barWidth;

			this.model.width = width;
			this.render();
		},

		onBarClick: function(e) {
			if (!this.allowInteractions()) return;

			e.preventDefault();
			e.stopPropagation();

			if (this.parent.state.get("isContinueLocked")) return;

			//.$(".container")
			var position = this.$(".inner").offset();
			var clientX = e.clientX;
			switch (e.type) {
			case "touchstart":
			case "touchmove":
			case "touchend":
				if (e.originalEvent.changedTouches) {
					clientX = e.originalEvent.changedTouches[0].clientX;
				} else {
					clientX = e.originalEvent.layerX;
				}
			}


			var leftPX = (clientX - position.left);
			if (leftPX < 0) leftPX = 0;
			var barWidth = this.$(".outer").width();

			var markSeconds = (this.model._endSeconds - this.model._startSeconds);
			var passedSeconds = (this.track.__seconds - this.model._startSeconds);

			var gotoSeconds = (leftPX/barWidth) * markSeconds;

			if (gotoSeconds < 0) gotoSeconds = 0;
			if (gotoSeconds > this.model._endSeconds) gotoSeconds = this.model._endSeconds;

			//console.log("going to", gotoSeconds);

			var currentTrackIndex = this.parent.model.get("_currentTrackIndex");

			this.parent.trackViews[currentTrackIndex].setCurrentSeconds(gotoSeconds);
			this.parent.resetSpritesAfterSeconds(this.parent.tracks[currentTrackIndex], gotoSeconds);

		},

		stateChange: function() {
			this.setupMarkers();
			this.render();
			this.$el[ this.parent.state.get("isContinueLocked") ? "addClass": "removeClass" ]('locked');
		},

		remove: function() {
			$(document).off("mouseup", this.onMouseUp);
			$(document).off("touchend", this.onMouseUp);
			$(document).off("mousemove", this.onMouseMove);
			$(document).off("touchmove", this.onMouseMove);
			Sprite.prototype.remove.call(this);
		}

	}, {

		spriteName: "scrub",
		template: "sprite-scrub",
		
		setup: function(options, sprite) {
			sprite.useStaticContainer = true;
		}

	});

	Scrub.loaded(Scrub);

	return Scrub;

});