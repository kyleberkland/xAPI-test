define([
    "../../controller"
], function(Controller) {

	//update sprite states in handlebars

	var SpritesState = function() {};
   

	var Sprites = Controller.extend({

		postInitialize: function(options) {

			this.state.set("sprites", new SpritesState(options));

		},
		
		stateChange: function(spriteView) {
			var liveSprites = this.state.get("liveSprites");
			var sprites = this.state.get("sprites");

			for (var k in liveSprites) {
				var liveSprite = liveSprites[k];
				if (liveSprite.isRemoving) return;
				if (liveSprite.isRemoved) return;

				var spriteId = liveSprite.model._id;

				var state = liveSprite.getState();

				sprites[spriteId] = state;
			}
		}
		
	});

	Controller.loaded(Sprites);

	return Sprites;

});
