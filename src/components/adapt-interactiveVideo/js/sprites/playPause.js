define([
	'../sprite'
], function(Sprite) {


	var Controls = Sprite.extend({

		events: {
			"click": "onBackgroundClick",
			"click .play-button": "onPlayClick"
		},

		postInitialize: function() {
			this.model._allowBackgroundClick = true;
			this.model._static = true;
		},

		onBackgroundClick: function(e) {
			e.preventDefault();
			e.stopPropagation();
			this.triggerPause();
		},

		onPlayClick: function(e) {
			e.preventDefault();
			e.stopPropagation();
			this.triggerPlay();
		}

	}, {
		spriteName: "playPause",
		template: "sprite-playPause"
	});

	Sprite.loaded(Controls);

	return Controls;

});