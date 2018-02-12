define([
	"../../controller"
], function(Controller) {

	var volumeRamp = 0.3;

	var LowerVolume = Controller.extend({

		imagePreloads: null,
		
		spritePrestart: function(track, sprite) {
			var media = this.trackViews[track._index];

			if (!sprite._pauseOnStart || media.inVolumeDown || sprite._hasVolume) return;

			this.waitFor(sprite._startSeconds-1.1, track.__seconds, function() {
				sprite._hasVolume = false;

				for (var i = 0, l = this.controllers.length; i < l; i++) {
                    var controller = this.controllers[i];
                    controller.mediaVolumeDown(media);
                }

			}, this);

			sprite._hasVolume = true;
			
		},

		waitFor: function(eventStartSeconds, timeNowSeconds, callback, context) {
			var waitDuration = (eventStartSeconds-timeNowSeconds) * 1000;
			if (waitDuration < 0) {
				waitDuration = 0;
			}
			waitDuration = parseInt(waitDuration);
			var callback = _.bind(callback, context);
			callback.waitForHandle = setTimeout(callback, waitDuration);
			callback.eventStartSeconds = eventStartSeconds;
			return callback;
		},

		mediaVolumeDown: function(media) {
            if (!media.hasVolume()) return;

            if (media.inVolumeDown || media.inVolumeUp) return;

            if (media.model && media.model.get("_mute")) {
                return;
            }

            var handle = setInterval(_.bind(function() {
                if (media.isRemoved) {
                    delete media.inVolumeDown;
                    return clearTimeout(handle);
                }
                if (media.inVolumeUp) {
                    delete media.inVolumeDown;
                    return clearTimeout(handle);
                }
                var currentVolume = media.getVolume();
                var newVolume = currentVolume-volumeRamp;
                if (newVolume < 0) newVolume = 0; 
                media.setVolume(newVolume);
                if (newVolume <= 0) {
                    clearTimeout(handle);
                    delete media.inVolumeDown;
                }
            }, this), 50);
            media.inVolumeDown = true;
        }

	});

	Controller.loaded(LowerVolume);

	return LowerVolume;

});
