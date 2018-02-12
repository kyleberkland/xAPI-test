define([
	'core/js/adapt',
], function(Adapt, Sprites, Controllers, Tracks) {

	var InteractiveVideo = window.InteractiveVideo = {

		spriteStore: {},
		controllerStore: [],
		trackStore: {},
		saved: null,

		register: function(type, name, classObject) {
			switch (type) {
			case "sprite":
				if (InteractiveVideo.spriteStore[name]) {
					throw "Sprite already registered";
				}

				InteractiveVideo.spriteStore[name] = classObject;
				break;
			case "controller":
				InteractiveVideo.controllerStore.push(name);
				break;
			case "track":
				if (InteractiveVideo.trackStore[name]) {
					throw "Sprite already registered";
				}

				InteractiveVideo.trackStore[name] = classObject;
				break;
			}
			
		},

		save: function(id, section, data) {
			if (!InteractiveVideo.saved) this.restore(id);

			var saved = InteractiveVideo.saved;

			saved[id] = saved[id] || {};
			saved[id][section] = data;

			Adapt.offlineStorage.set("iv", JSON.stringify(this.saved));
		},

		reset: function(id) {
			if (!InteractiveVideo.saved) this.restore(id);

			var saved = InteractiveVideo.saved;

			saved[id] = saved[id] || {};
			saved[id] = {};

			Adapt.offlineStorage.set("iv", JSON.stringify(this.saved));
		},

		restore: function(id) {			
			if (!InteractiveVideo.saved) {
				var restored = Adapt.offlineStorage.get("iv");
				if (restored) {
					InteractiveVideo.saved = JSON.parse(restored);
				}
			}

			if (!InteractiveVideo.saved) InteractiveVideo.saved = {};

			return InteractiveVideo.saved[id];
		}

	};

	_.extend(InteractiveVideo, Backbone.Events);

	InteractiveVideo.trigger("initialized");

	return InteractiveVideo;
});