define([
	'../sprite'
], function(Sprite) {


	var Controls = Sprite.extend({

		events: {
			"click .fullscreen-button": "onFullScreenClick"
		},

		postInitialize: function() {
			this.model._allowBackgroundClick = true;
			this.model._static = true;
			this.state.set("isFullScreenAllowed", this.parent.state.get("isFullScreenAllowed"));
		},

		onFullScreenClick: function(e) {
			e.preventDefault();
			e.stopPropagation();
			this.triggerFullScreen();
		},

		fullScreenIn: function() {
			this.state.set("isFullScreen", true);
		},

		fullScreenOut: function() {
			this.state.set("isFullScreen", false);
		}

	}, {
		spriteName: "fullscreen",
		template: "sprite-fullscreen"
	});

	Sprite.loaded(Controls);

	return Controls;

});