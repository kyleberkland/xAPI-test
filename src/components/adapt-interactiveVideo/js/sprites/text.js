define([
	'../sprite'
], function(Sprite) {

	var Text = Sprite.extend({

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

		spriteName: "text",
		template: "sprite-text"

	});

	Sprite.loaded(Text);

	return Text;

});