define([
    'libraries/mediaelement-and-player'
], function() {

	var MediaFeatures = {
		init: function() {
			var
				t = this,
				d = document,
				nav = mejs.PluginDetector.nav,
				ua = mejs.PluginDetector.ua.toLowerCase(),
				i,
				v,
				html5Elements = ['source','track','audio','video'];

			// detect browsers (only the ones that have some kind of quirk we need to work around)
			t.isiPad = (ua.match(/ipad/i) !== null);
			t.isiPhone = (ua.match(/iphone/i) !== null);
			t.isiOS = t.isiPhone || t.isiPad;

			if (t.isiOS) return;

			t.isAndroid = (ua.match(/android/i) !== null);
			t.isBustedAndroid = (ua.match(/android 2\.[12]/) !== null);
			t.isBustedNativeHTTPS = (location.protocol === 'https:' && (ua.match(/android [12]\./) !== null || ua.match(/macintosh.* version.* safari/) !== null));
			t.isIE = (nav.appName.toLowerCase().indexOf("microsoft") != -1 || nav.appName.toLowerCase().match(/trident/gi) !== null);
			t.isChrome = (ua.match(/chrome/gi) !== null);
			t.isChromium = (ua.match(/chromium/gi) !== null);
			t.isFirefox = (ua.match(/firefox/gi) !== null);
			t.isSafari = (ua.match(/safari/gi) !== null);
			t.isMacintosh = (ua.match(/macintosh/gi) !== null);
			t.isWebkit = (ua.match(/webkit/gi) !== null);
			t.isGecko = (ua.match(/gecko/gi) !== null) && !t.isWebkit && !t.isIE;
			t.isOpera = (ua.match(/opera/gi) !== null);
			t.hasTouch = ('ontouchstart' in window); //  && window.ontouchstart != null); // this breaks iOS 7

			if (t.isMacintosh && t.isSafari && !t.isChrome && !t.isFirefox) return;

			// Borrowed from `Modernizr.svgasimg`, sources:
			// - https://github.com/Modernizr/Modernizr/issues/687
			// - https://github.com/Modernizr/Modernizr/pull/1209/files
			t.svgAsImg = !!document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Image', '1.1');

			// create HTML5 media elements for IE before 9, get a <video> element for fullscreen detection
			for (i=0; i<html5Elements.length; i++) {
				v = document.createElement(html5Elements[i]);
			}

			t.supportsMediaTag = (typeof v.canPlayType !== 'undefined' || t.isBustedAndroid);

			// Fix for IE9 on Windows 7N / Windows 7KN (Media Player not installer)
			try{
				v.canPlayType("video/mp4");
			}catch(e){
				t.supportsMediaTag = false;
			}

			t.supportsPointerEvents = (function() {
				// TAKEN FROM MODERNIZR
				var element = document.createElement('x'),
					documentElement = document.documentElement,
					getComputedStyle = window.getComputedStyle,
					supports;
				if(!('pointerEvents' in element.style)){
					return false;
				}
				element.style.pointerEvents = 'auto';
				element.style.pointerEvents = 'x';
				documentElement.appendChild(element);
				supports = getComputedStyle &&
					getComputedStyle(element, '').pointerEvents === 'auto';
				documentElement.removeChild(element);
				return !!supports;
			})();

			if (this.isFullScreenAlwaysInWindow) {
				t.hasNativeFullScreen = false;
				t.hasiOSFullScreen = false;
				return;
			}


			 // Older versions of Firefox can't move plugins around without it resetting,
			t.hasFirefoxPluginMovingProblem = false;

			// detect native JavaScript fullscreen (Safari/Firefox only, Chrome still fails)

			// iOS
			t.hasiOSFullScreen = (typeof v.webkitEnterFullscreen !== 'undefined');

			// W3C
			t.hasNativeFullscreen = (typeof v.requestFullscreen !== 'undefined');

			// webkit/firefox/IE11+
			t.hasWebkitNativeFullScreen = (typeof v.webkitRequestFullScreen !== 'undefined');
			t.hasMozNativeFullScreen = (typeof v.mozRequestFullScreen !== 'undefined');
			t.hasMsNativeFullScreen = (typeof v.msRequestFullscreen !== 'undefined');

			t.hasTrueNativeFullScreen = (t.hasWebkitNativeFullScreen || t.hasMozNativeFullScreen || t.hasMsNativeFullScreen);
			t.nativeFullScreenEnabled = t.hasTrueNativeFullScreen;

			// Enabled?
			if (t.hasMozNativeFullScreen) {
				t.nativeFullScreenEnabled = document.mozFullScreenEnabled;
			} else if (t.hasMsNativeFullScreen) {
				t.nativeFullScreenEnabled = document.msFullscreenEnabled;
			}

			if (t.isChrome) {
				t.hasiOSFullScreen = false;
			}

			if (t.hasTrueNativeFullScreen) {

				t.fullScreenEventName = 'fullscreenchange';
				if (t.hasWebkitNativeFullScreen) {
					t.fullScreenEventName = 'webkitfullscreenchange';

				} else if (t.hasMozNativeFullScreen) {
					t.fullScreenEventName = 'mozfullscreenchange';

				} else if (t.hasMsNativeFullScreen) {
					t.fullScreenEventName = 'MSFullscreenChange';
				}

				t.isFullScreen = function() {
					if (t.hasMozNativeFullScreen) {
						return d.mozFullScreen;

					} else if (t.hasWebkitNativeFullScreen) {
						return d.webkitIsFullScreen;

					} else if (t.hasMsNativeFullScreen) {
						return d.msFullscreenElement !== null;
					}
				}

				t.requestFullScreen = function(el) {

					if (t.hasWebkitNativeFullScreen) {
						el.webkitRequestFullScreen();

					} else if (t.hasMozNativeFullScreen) {
						el.mozRequestFullScreen();

					} else if (t.hasMsNativeFullScreen) {
						el.msRequestFullscreen();

					}
				}

				t.cancelFullScreen = function() {
					if (t.hasWebkitNativeFullScreen) {
						document.webkitCancelFullScreen();

					} else if (t.hasMozNativeFullScreen) {
						document.mozCancelFullScreen();

					} else if (t.hasMsNativeFullScreen) {
						document.msExitFullscreen();

					}
				}

			}


			// OS X 10.5 can't do this even if it says it can :(
			if (t.hasiOSFullScreen && ua.match(/mac os x 10_5/i)) {
				t.hasNativeFullScreen = false;
				t.hasiOSFullScreen = false;
			}

		}
	};

	window.MediaFeatures = MediaFeatures;
	window.MediaFeatures.init();

	var pub = {
		MediaFeatures: MediaFeatures,

		extend: function(proto) {

			_.extend(proto, {

				isFullScreen: false,
				//isAlwaysFullWindow: false,
				//isFullScreenAlwaysInWindow: false,

				setupFullScreen: function() {
					var t = this;

					this.___detectFullscreenMode();

					if (t.___fullscreenMode == 'fullwindow' && t.isAlwaysFullWindow) {
						t.isFullScreenAllowed = false;
					} else {
						t.isFullScreenAllowed = true;
					}
					
					if (t.isAlwaysFullWindow) {
						t.container
							.addClass("in-fullwindow")
							.width('100%')
							.height('100%');
						$(document.documentElement).addClass('in-fullwindow-view');
					}
				},

				enterFullScreen: function() {

					var t = this;

					t.isFullScreen = true;
					t.___fullScreenTrip = true;

					// set it to not show scroll bars so 100% will work
		            $(document.documentElement).addClass('in-fullscreen-view');

					// attempt to do true fullscreen
					if (!this.isFullScreenAlwaysInWindow && t.___fullscreenMode === 'native-native') {

						pub.MediaFeatures.requestFullScreen(t.container[0]);
						//return;
						
					} else if (t.___fullscreenMode == 'fullwindow') {				
						// move into position
						t.container.addClass("in-fullwindow");
					}			
					
					// make full size
					t.container
						.addClass("in-fullscreen")
						.width('100%')
						.height('100%');

						t.containerSizeTimeout = setTimeout(function() {
							t.container.css({width: '100%', height: '100%'});
						}, 500);


					this.___setupFullScreenChangeListeners();

				},

				exitFullScreen: function() {

					var t = this;

					// come out of native fullscreen
					if (!this.isFullScreenAlwaysInWindow && pub.MediaFeatures.hasTrueNativeFullScreen && (pub.MediaFeatures.isFullScreen() || t.isFullScreen)) {
						pub.MediaFeatures.cancelFullScreen();
					}

					// Prevent container from attempting to stretch a second time
		            clearTimeout(t.containerSizeTimeout);

					this.___removeFullScreen();
				},
									
				// Possible modes
				// (1) 'native-native' 	HTML5 video  + browser fullscreen (IE10+, etc.)
				// (2) 'fullwindow' 	Full window (retains all UI)
				___fullscreenMode: '',
				
				___detectFullscreenMode: function() {
					
					var t = this,
						mode = '',
						features = pub.MediaFeatures;
					
					if (!this.isFullScreenAlwaysInWindow && features.hasTrueNativeFullScreen) {
						mode = 'native-native';			
					} else { 
						mode = 'fullwindow';
					}
					
					
					t.___fullscreenMode = mode;		
					return mode;
				},
				
				___containerSizeTimeout: null,

				___removeFullScreen: function() {

					var t = this;

					$(document).off(pub.MediaFeatures.fullScreenEventName, this.___onFullScreenChange);

					// restore scroll bars to document
		            $(document.documentElement).removeClass('in-fullscreen-view');

		            if (!t.isAlwaysFullWindow) {
		            	t.container
					    	.removeClass("in-fullwindow")
					    	.width("")
							.height("");
					}

					t.container
					    .removeClass("in-fullscreen");

					t.isFullScreen = false;

					t.trigger('exitedfullscreen');
				},

				___isOnFullScreenChangeBound: false,

				___setupFullScreenChangeListeners: function() {

					var t = this;
					if (!this.___isOnFullScreenChangeBound) {
						this.___onFullScreenChange = _.bind(this.___onFullScreenChange, this);
						this.___isOnFullScreenChangeBound = true;
					}

					if (t.___fullscreenMode == 'fullwindow') {
						$(document).on("keydown", this.___onFullScreenChange);
						this.trigger("enteredfullscreen");
					} else {
						$(document).on(pub.MediaFeatures.fullScreenEventName, this.___onFullScreenChange);
					}

				},

				___fullScreenTrip: false,
				___onFullScreenChange: function(e) {

					console.log("is fullscreen", this.isFullScreen);
					//return;

					if (e.type === "keydown") {
						if (e.which !== 27) return;
					}

					if (this.___fullScreenTrip) {
						this.trigger("enteredfullscreen");
						this.___fullScreenTrip = false;
						return;
					}

					if (!this.isFullScreen) {
						$(document).off(pub.MediaFeatures.fullScreenEventName, this.___onFullScreenChange);
						return;
					}

				    this.___removeFullScreen();

				}
			});
		}
	};

	return pub;

});