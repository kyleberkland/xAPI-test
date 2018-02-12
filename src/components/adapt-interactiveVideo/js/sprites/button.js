define([
	'../sprite',
	'./textAndGraphic'
], function(Sprite, TextAndGraphic) {


	var Button = TextAndGraphic.extend({

		events: function() {
			return _.extend({
				"click .item-button": "onItemClick",
				"dblclick .item-button": "onItemClick"
			}, TextAndGraphic.prototype.events);
		},

		preRender: function() {
			if (this.model._positionTop && !this.el.style.top) this.$el.css("top", this.model._positionTop+"%");
			if (this.model._positionLeft && !this.el.style.left) this.$el.css("left", this.model._positionLeft+"%");
			if (this.model._positionLeft || this.model._positionTop) this.$el.css("position", "absolute");
		},

		onItemClick: function(e) {
			if (!this.allowInteractions()) return;

			var $button = $(e.currentTarget);
			e.preventDefault();
			e.stopPropagation();

			var index =  parseInt($button.attr("index"));

			var button = this.model;

			if (button._onClickVisited) {
				button.isVisited = true;
			}

			this.parent.stateChanged();
			
			if (button._isEnded) return;

			this.render();

			var hasMoved = false;
			
			if (button._endOnClick) {
				this.setEnded();
				this.triggerContinue()
			}

			if (button._onClickRule) {
				this.triggerRule(button._onClickRule, button);
			}


			if (button._endOnClick) {
				this.remove();
			}

			this.parent.stateChanged();
			
		}

	}, {

		spriteName: "button",
		template: "sprite-button",

		setup: function(options, sprite) {
			var path = options.path;

    		var item = sprite;
    		if (item._graphic && item._graphic) {
	            if (item._graphic.substr(0, path.length) !== path ) 
	                item._graphic = path + "/assets/" + item._graphic;   
	        }

	        if (item._backgroundGraphic && item._backgroundGraphic) {
	            if (item._backgroundGraphic.substr(0, path.length) !== path )
	                item._backgroundGraphic = path + "/assets/" + item._backgroundGraphic;   
	        }

	        if (!item.text && (item._graphic || item._backgroundGraphic)) {
	        	item.isGraphicOnly = true;
	        }

		},

		preloadImages: function(returnSrcArray, sprite) {

			if (sprite._graphic && sprite._graphic) {
	            returnSrcArray.push(sprite._graphic);
	        }

	        if (sprite._backgroundGraphic && sprite._backgroundGraphic) {
	            returnSrcArray.push(sprite._backgroundGraphic);
	        }

		},

		reset: function(sprite) {
    		var item = sprite;
    		item.isDisabled = false;
		}

	});

	Sprite.loaded(Button);

	return Button;
});
