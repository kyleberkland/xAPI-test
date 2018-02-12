//RETURN AN ARRAY OF ALL DOM EVENT NAMES
$.domevents = $.domevents || (function() {

	// Collect all dom node events
	var domElementEvents = { // iOS fix, event properties are not enumerable on HTMLElement.prototype
		'click': true,
		'touchstart': true,
		'touchend': true,
		'touchmove': true,
		'load': true,
		'play': true,
		'pause': true,
		'finish': true
	};

	for (var prop in HTMLElement.prototype) {
		if (prop.substr(0,2) != "on") continue;
		domElementEvents[prop.substr(2)] = true;
	}

	return domElementEvents;

})();