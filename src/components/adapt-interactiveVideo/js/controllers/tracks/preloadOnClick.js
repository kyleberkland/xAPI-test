define([
	"../../controller"
], function(Controller) {

	var PreloadOnClick = Controller.extend({

		countPreloaded: 0,
		awaitingPreload: 0,
		tracksPreloaded: false,

		mediaPreload: function(track, seconds, toPaused) {
			this.countPreloaded = 0;
			this.awaitingPreload = 0;
			this.spritesPreload(track, seconds, toPaused);
			this.tracksPreloaded = true;
			this.trackStart(track, seconds);
			//this.tracksPreload(track, seconds, toPaused);
		},

		spritesPreload: function() {

			var liveSprites = this.state.get("liveSprites");
			for (var k in liveSprites) {
				if (liveSprites[k]._isPreloaded) continue;
				liveSprites[k]._isPreloaded = true;
				if (liveSprites[k].preload()) {
					this.awaitingPreload++;
					this.listenToOnce(liveSprites[k], "preloaded", this.onPreloaded, this);
				}
			}
			
		},

		trackStart: function(track, seconds) {
			for (var i = 0, l = this.trackViews.length; i < l ; i++) {
				var trackView = this.trackViews[i];
				if (trackView.model.get("_id") === track._id) {
					if (trackView.hasPreloaded) {
						//this.parent.preloaded();
						return;
					} else {
						this.listenToOnce(trackView, "preloaded", this.onTrackPreloaded, this);
						trackView.preload(seconds);
						trackView.hasPreloaded = true;
						return;
					}
				}
					
			}
			
		},

		// tracksPreload: function(track, seconds, toPaused) {
		// 	if (this.tracksPreloaded) return;
		// 	this.state.set("isTrackLoading", true);

		// 	for (var i = 0, l = this.trackViews.length; i < l ; i++) {
		// 		this.awaitingPreload++;
		// 		var trackView = this.trackViews[i];
		// 		trackView.preload();
		// 		this.listenToOnce(trackView, "preloaded", this.onPreloaded, this);
		// 	}

		// 	this.tracksPreloaded = true;
		// },

		onTrackPreloaded: function() {
			this.parent.preloaded();
		},

		onPreloaded: function() {
			this.countPreloaded++;
			
			if (this.countPreloaded !== this.awaitingPreload) {
				//console.log("preloaded", this.countPreloaded, "of", this.awaitingPreload);
				return;
			}

			//console.log("preloaded all", this.countPreloaded, "of", this.awaitingPreload);

			_.defer(_.bind(function() {
				this.parent.preloaded();
			}, this));
		}

	});

	Controller.loaded(PreloadOnClick);

	return PreloadOnClick;

});
