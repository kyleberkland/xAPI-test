define([
	'../sprite'
], function(Sprite) {

	var TextAndGraphic = Sprite.extend({

		onBackgroundClick: function(e) {
			e.stopPropagation();
			if (this.model._endOnClose || this.model._endOnContinue) {
				this.onCloseClick();
			}
		},

		events: {
			"click .close-button": "onCloseClick",
			"click .continue-button": "onCloseClick",
			"click a": "stopPropagation"
		},

		stopPropagation: function(e) {
			e.stopPropagation();
		},

		stateChange: function() {
			this.render();
		},

		scoreChange: function() {
			this.render();
		},

		onCloseClick: function(event) {
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}
			
			if (!this.allowInteractions()) return;

			if (this.model._endOnClick) this.setEnded();
			this.triggerRule(this.model._onCloseRule);
			this.triggerContinue();
			this.remove();
		}
		

	}, {

		spriteName: "textAndGraphic",
		template: "sprite-textAndGraphic",

		setup: function(options, sprite) {
			var path = options.path;
				
			if (sprite._graphic && sprite._graphic) {
	            if (sprite._graphic.substr(0, path.length) !== path ) 
	                sprite._graphic = path + "/assets/" + sprite._graphic;   
	        }

	        if (sprite._backgroundGraphic && sprite._backgroundGraphic) {
	            if (sprite._backgroundGraphic.substr(0, path.length) !== path )
	                sprite._backgroundGraphic = path + "/assets/" + sprite._backgroundGraphic;   
	        }

		},

		preloadImages: function(returnSrcArray, sprite) {

			if (sprite._graphic && sprite._graphic) {
	            returnSrcArray.push(sprite._graphic);
	        }

	        if (sprite._backgroundGraphic && sprite._backgroundGraphic) {
	            returnSrcArray.push(sprite._backgroundGraphic);
	        }

		}

	});

	Sprite.loaded(TextAndGraphic);

	return TextAndGraphic;

});