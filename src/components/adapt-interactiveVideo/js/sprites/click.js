define([
	'../sprite'
], function(Sprite) {


	var Click = Sprite.extend({

		postInitialize: function() {
			return Sprite.prototype.postInitialize.call(this, arguments);
		},

		backgroundClick: function(e) {
			if (!this.allowInteractions()) return;

			if (this.isRemoving || this.isRemoved || this.model._isEnded) return;

			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}
			if (this.model._endOnClick) this.setEnded();
			this.triggerRule(this.model._onClickRule);
		},

		remove: function() {
			return Sprite.prototype.remove.call(this, arguments);
		}		

	}, {
		spriteName: "click",
		template: "sprite-click"
	});

	Sprite.loaded(Click);

	return Click;

});