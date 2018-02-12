define([
	"../../controller"
], function(Controller) {

	var PreloadImages = Controller.extend({

		spritePreload: function(track, sprite) {
			this.imagePreloads = this.imagePreloads || [];

			InteractiveVideo.spriteStore[sprite._type].preloadImages(this.imagePreloads, sprite)

			this.imagePreloads = _.uniq(this.imagePreloads);

			this.state.set("_preloadImages", this.imagePreloads);
			sprite._hasPreloadedImages = true;

			
		}

	});

	Controller.loaded(PreloadImages);

	return PreloadImages;

});
