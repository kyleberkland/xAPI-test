define([
	'../sprite'
], function(Sprite) {

	var Graphic = Sprite.extend({

		onBackgroundClick: function(e) {
			e.stopPropagation();
		},

		preRender: function() {
			if (this.model._positionTop && !this.el.style.top) this.$el.css("top", this.model._positionTop+"%");
			if (this.model._positionLeft && !this.el.style.left) this.$el.css("left", this.model._positionLeft+"%");
			if (this.model._positionLeft || this.model._positionTop) this.$el.css("position", "absolute");
		},

		events: {
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
		}		

	}, {

		spriteName: "graphic",
		template: "sprite-graphic",

		setup: function(options, sprite) {
			var path = options.path;
				
			if (sprite._graphic && sprite._graphic) {
	            if (sprite._graphic.substr(0, path.length) !== path ) 
	                sprite._graphic = path + "/assets/" + sprite._graphic;   
	        }
		},

		preloadImages: function(returnSrcArray, sprite) {

			if (sprite._graphic && sprite._graphic) {
	            returnSrcArray.push(sprite._graphic);
	        }

		}

	});

	Sprite.loaded(Graphic);

	return Graphic;

});