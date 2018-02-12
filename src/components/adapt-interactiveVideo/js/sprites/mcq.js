define([
	'../sprite',
	'./textAndGraphic'
], function(Sprite, TextAndGraphic) {


	var Mcq = TextAndGraphic.extend({

		events: function() {
			return _.extend({
				"click .selector-button": "onItemClick",
				"click .submit-button": "onSubmitClick"
			}, TextAndGraphic.prototype.events);
		},

		onItemClick: function(e) {
			if (!this.allowInteractions()) return;

			var $button = $(e.currentTarget);
			var index =  parseInt($button.attr("index"));

			var button = this.model._items[index];

			var hasMoved = false;
			
			if (!this.model.multipleSelect) {
				for (var i = 0, l = this.model._items.length; i < l; i++) {
					this.model._items[i].value = false;
				}
			}

			if (button.value) {
				button.value = false;
			} else {
				button.value = true;
			}

			this.render();

			if (button._onClickRule) {
				this.triggerRule(button._onClickRule, button);
			}
			if (button._endOnClick) {
				this.setEnded();
				if (!hasMoved) this.triggerContinue()
				this.remove();
			}
			
		},

		onSubmitClick: function(e) {
			if (!this.allowInteractions()) return;

			var hasMoved = false;
			
			if (this.model._onSubmitRule) {
				this.triggerRule(this.model._onSubmitRule);
			}
			if (this.model._endOnSubmit) {
				this.setEnded();
				if (!hasMoved) this.triggerContinue()
				this.remove();
			}
		}
		

	}, {
		spriteName: "mcq",
		template: "sprite-mcq",

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

	Sprite.loaded(Mcq);

	return Mcq;
});