define([
	'../sprite'
], function(Sprite) {


	var Rule = Sprite.extend({
	
		start: function() {
			//this.setEnded();
		}

	}, {
		spriteName: "rule",
		template: "sprite-rule"
	});

	Sprite.loaded(Rule);

	return Rule;

});