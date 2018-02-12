define([
	'../sprite'
], function(Sprite) {


	var Controls = Sprite.extend({

		events: {
			"click .home-button": "onHomeClick"
		},

		postInitialize: function() {
			this.model._allowBackgroundClick = true;
		},

		onHomeClick: function(e) {
			e.preventDefault();
			e.stopPropagation();

			var hasMoved = false;

			if (this.model._onClickRule) {
				this.triggerRule(this.model._onClickRule);
			}
			if (this.model._onCloseRule) { //bug in editor
				this.triggerRule(this.model._onCloseRule);
			}
			if (this.model._endOnClick) {
				this.setEnded();
				this.remove(0);
			}
		},

		stateChange: function() {
			this.render();
		},

		scoreChange: function() {
			this.render();
		}

	}, {
		spriteName: "home",
		template: "sprite-home",

		setup: function(options, sprite) {
			sprite.useStaticContainer = true;
		}

	});

	Sprite.loaded(Controls);

	return Controls;

});