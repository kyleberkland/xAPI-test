define([
	'../sprite',
	'./textAndGraphic'
], function(Sprite, TextAndGraphic) {


	var TopBar = TextAndGraphic.extend({

		events: function() {
			return _.extend({
				"click .item-button": "onItemClick",
				"dblclick .item-button": "onItemClick"
			}, TextAndGraphic.prototype.events);
		},

		onItemClick: function(e) {
			if (!this.allowInteractions()) return;

			var $button = $(e.currentTarget);
			e.preventDefault();
			e.stopPropagation();

			var index =  parseInt($button.attr("index"));

			var button = this.model._items[index];

			if (this.model._onClickVisited || button._onClickVisited) {
				button.isVisited = true;
				this.model.isVisited = true;
			}

			this.parent.stateChanged();
			
			if (this.model._isEnded) return;

			this.render();

			this.model._hasMoved = false;

			if (this.model._onClickRule) {
				this.triggerRule(this.model._onClickRule, button);
			}
			
			if (button._onClickRule) {
				this.triggerRule(button._onClickRule, button);
			}

			if (button._endOnClick) {
				this.setEnded();
				if (!this.model._hasMoved) this.triggerContinue();
				this.remove();
			}

			this.model._hasMoved = false;

			this.parent.stateChanged();
			
		}

	}, {

		spriteName: "topbar",
		template: "sprite-topbar",

		setup: function(options, sprite) {
			var path = options.path;

	        if (sprite._items) {
	        	for (var i = 0, l = sprite._items.length; i < l; i++) {
	        		var item = sprite._items[i];
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
	        	}
	        }

		},

		preloadImages: function(returnSrcArray, sprite) {

		},

		reset: function(sprite) {
			if (sprite._items) {
	        	for (var i = 0, l = sprite._items.length; i < l; i++) {
	        		var item = sprite._items[i];
	        		item.isDisabled = false;
	        	}
	        }
		}

	});

	Sprite.loaded(TopBar);

	return TopBar;
});