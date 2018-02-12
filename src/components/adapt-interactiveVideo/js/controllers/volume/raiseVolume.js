define([
	"../../controller"
], function(Controller) {

    var volumeRamp = 0.3;

	var RaiseVolume = Controller.extend({

		trackPreplay: function(trackView) {

			for (var i = 0, l = this.controllers.length; i < l; i++) {
                var controller = this.controllers[i];
                controller.mediaVolumeUp(trackView);
            }
			
		},

		mediaVolumeUp: function(media) {
            if (!media.hasVolume()) return;
            
            if (media.inVolumeUp || media.inVolumeDown) return;

            if (media.model && media.model.get("_mute")) {
                return;
            }

            var handle = setInterval(_.bind(function() {
                if (media.isRemoved) {
                     delete media.inVolumeUp;
                    return clearTimeout(handle);
                }
                var currentVolume = media.getVolume();
                var newVolume = (currentVolume + volumeRamp);
                if (newVolume > 1) newVolume = 1;
                media.setVolume(newVolume);
                if (currentVolume >= 1) {
                    clearTimeout(handle);
                    delete media.inVolumeUp;
                }
            }, this), 25);

            media.inVolumeUp = true;
        }

	});

	Controller.loaded(RaiseVolume);

	return RaiseVolume;

});
