define([
    "../track"
], function(Track) {

    var mep_defaults = {
        "poster": "",
        "showPosterWhenEnded": false,
        "defaultVideoWidth": 480,
        "defaultVideoHeight": 270,
        "videoWidth": -1,
        "videoHeight": -1,
        "defaultAudioWidth": 400,
        "defaultAudioHeight": 30,
        "defaultSeekBackwardInterval": "(media.duration * 0.05)",
        "defaultSeekForwardInterval": "(media.duration * 0.05)",
        "audioWidth": -1,
        "audioHeight": -1,
        "startVolume": 1,
        "loop": false,
        "autoRewind": false,
        "enableAutosize": true,
        "alwaysShowHours": false,
        "showTimecodeFrameCount": false,
        "framesPerSecond": 12.5,
        "autosizeProgress" : true,
        "alwaysShowControls": true,
        "hideVideoControlsOnLoad": true,
        "clickToPlayPause": false,
        "iPadUseNativeControls": false,
        "iPhoneUseNativeControls": false,
        "AndroidUseNativeControls": false,
        "features": ['playpause', 'progress','tracks'],
        "isVideo": true,
        "enableKeyboard": true,
        "pauseOtherPlayers": false,
        "startLanguage": "en",
        "tracksText": "",
        "hideCaptionsButtonWhenEmpty": true,
        "toggleCaptionsButtonWhenOnlyOne": true,
        "slidesSelector": ""
    };

    var uid = 0;

    var tagpool = [];
    var poolUid = 0;
    var attributes = [ "preload", "poster", "width", "height", "style", "src", "controls", "loop" ];


    var MediaElementTrackView = Track.extend({

        renderOnChange: false,
        fromPool: false,

        className: function() {
            return "mediaelement-widget a11y-ignore-aria";
        },

        postInitialize: function(options) {
            this.parent = options.parent;
            this.interactivevideo = options.interactivevideo;
            this.uid = uid++;

            this._hasTimeBeenSet = {
                flag: false,
                seekTo: 0
            };
        },

        active: function(value) {
            //debugger;
        },

        preRender: function(isFirstRender) {
            if (!isFirstRender) return;

            var speed = "fast";
            if (window.speedtest) speed = speedtest.low_name;

            var isAndroid = $.fn.inlinevideo.isAndroid;
            var isiOS = $.fn.inlinevideo.isiOS;
            if (isAndroid || isiOS) {
                //force android and ios to use lower quality videos
                //this is to limit the amount of memoery required
                //console.log("Forcing low quality videos");
                speed = "slow";
            }
            if (isAndroid) {
                //console.log("Forcing webm videos");
                this.model.get("_media").extension = "webm";
            } else {
                this.model.get("_media").extension = "mp4";
            }

            if (this.model.get("_subtitles")) {
                this.model.set("_useClosedCaptions", true);
                var path = this.interactivevideo.model.get("_path");
                this.model.get("_media").cc = {
                    src: path + "/assets/" + this.model.get("_subtitles"),
                    srclang: this.model.get("cssLang") || "en"
                };
            }

            var platform = "computer";
            if (isAndroid) platform = "android";
            if (isiOS) platform = "ios";

            this.state.set("speed", speed);
            this.state.set("platform", platform)
        },

        postRender: function(isFirstRender) {
            if (!isFirstRender) return;

            if ($.fn.inlinevideo.isiPad && $.fn.inlinevideo.version < 9.35) {
                //force ipads to reuse video tags 
                //ipads have a 16 tag play limit before they need to be reused
                //TODO: this needs to be extended into the track rendering and playing
                //maximum two tracks rendered
                if (tagpool.length > 0) {
                    this.fromPool = true;
                    var $reused = tagpool.pop();
                    //console.log("not fresh", $reused);
                    for (var i = 0, l = attributes.length; i < l; i++) {
                        var attr = attributes[i];
                        $reused.removeAttr(attr);
                    }
                    $reused.html("").append(this.$("video").children());
                    var $unused = this.$("video");
                    for (var i = 0, l = attributes.length; i < l; i++) {
                        var attr = attributes[i];
                        $reused.attr(attr, $unused.attr(attr));
                    }
                    $unused.replaceWith($reused);
                    $reused.removeAttr("mute");
                    //console.log("reuse", $reused[0].poolUid);
                } else {
                    //console.log("fresh", this.$("video"));
                }
            }

            this.setupPlayer();
        },

        setupPlayer: function() {
            if (!this.model.get('_playerOptions')) this.model.set('_playerOptions', {});

            var modelOptions = _.extend({}, mep_defaults);

            modelOptions.pluginPath = 'assets/';

            if (this.model.get("features")) modelOptions.features = this.model.get("features");

            modelOptions.success = _.bind(this.onPlayerReady, this);

            if (this.model.get('_autoRewind')) {
                modelOptions.autoRewind = true;
            }

            if (this.model.get('_alwaysShowControls')) {
                modelOptions.alwaysShowControls = true;
            }

            if (this.model.get('_loop')) {
                modelOptions.loop = true;
            }

            if (this.model.get('_mute')) {
                this._isMuted = true;
                modelOptions.startVolume = 0;
                modelOptions.volume = 0;
            }

            if (this.model.get('_useClosedCaptions')) {
                modelOptions.startLanguage = this.model.get('_startLanguage') === undefined ? 'en' : this.model.get('_startLanguage');
            }

            this.addMediaTypeClass();

            // create the player
            this.$('video').mediaelementplayer(modelOptions);

            // We're streaming - set ready now, as success won't be called above
            if (this.model.get('_media').source) {
                this.$('.media-widget').addClass('external-source');
                this.setReadyStatus();
            }
        },

        addMediaTypeClass: function() {
            var media = this.model.get("_media");
            if (media.type) {
                var typeClass = media.type.replace(/\//, "-");
                this.$(".media-widget").addClass(typeClass);
            }
        },

        setupEventListeners: function() {
            this.videoElement.addEventListener("start", _.bind(this.onEventFired, this));
            this.videoElement.addEventListener("play", _.bind(this.onEventFired, this));
            this.videoElement.addEventListener("pause", _.bind(this.onEventFired, this));
            this.videoElement.addEventListener("ended", _.bind(this.onEventFired, this));
            this.videoElement.addEventListener('timeupdate', _.bind(this.onEventFired, this));
            this.videoElement.addEventListener('seeked', _.bind(this.onEventFired, this));
        },

        onEventFired: function(e) {
            if (this.isRemoved) return;
            if (this._isPreLoading) {
                this._isPreLoading = false;
                this._isPreLoaded = true;
                if (!this._keepingPreloadPlaying) {
                    this.videoElement.pause();
                    try {
                        this.videoElement.setCurrentTime(seconds || 0);
                    } catch(e) {};
                }
                if (!this._isMuted) this.videoElement.setVolume(1);
                //console.log("videoElement", this.uid, "preloaded");
                this.trigger("preloaded");
                return;
            }
            switch (e.type) {
            case "seeked":
                if (!this._hasTimeBeenSet.flag) {
                    this._hasTimeBeenSet.flag = true;
                }
            case "timeupdate":
                //console.log("track time", this.videoElement.player.node.currentTime);
                if (!this._hasTimeBeenSet.flag) {
                    var isNearTime = Math.abs(this._hasTimeBeenSet.seekTo - this.videoElement.currentTime) < 100;
                    if (isNearTime) {
                        this._hasTimeBeenSet.flag = true;
                    } else {
                        try {
                            //console.log("seekTo", this._hasTimeBeenSet.seekTo);
                            console.log("videoElement", this.uid, "setting time");
                            if (MediaFeatures.isiOS) {
                                this.videoElement.player.node.setCurrentTime(this._hasTimeBeenSet.seekTo);
                            } else {
                                this.videoElement.player.setCurrentTime(this._hasTimeBeenSet.seekTo);
                            }
                        } catch(e) {
                            //console.log("seek error", e);
                        }
                        return;
                    }
                }
                if (this.model.get("_mute") || this._isMuted) this.videoElement.setVolume(0);
                var currentSeconds = Math.ceil(this.videoElement.currentTime*10)/10;
                if (this.triggerSeconds !== currentSeconds) {
                    //console.log("seconds videoElement", this.uid, currentSeconds);
                    this.trigger("seconds", this, currentSeconds);
                    this.triggerSeconds = currentSeconds
                }
                break;
            case "ended":
                if (this.superTimer) {
                    clearInterval(this.superTimer);
                    this.superTimer = null;
                }
                if ($("html").is(".iPhone")) {
                    this.$("video")[0].webkitExitFullScreen();
                }
                this.trigger("finish", this);
                break;
            case "play":
                this.superTimer = setInterval(_.bind(function() {
                    this.onEventFired({type:"timeupdate"});
                }, this), 100);
                this.trigger("play", this);
                break;
            case "pause":
                if (this.superTimer) {
                    clearInterval(this.superTimer);
                    this.superTimer = null;
                }
                this.trigger("pause", this);
                break;
            default:
                debugger;
            }
        },

        play: function(seekTo) {
            this.interactivevideo.globalMediaStop();
            if (!this.videoElement) return;
            if (this.$("video")[0].poolUid === undefined) {
                this.$("video")[0].poolUid = poolUid++;
            }

            this.hasPlayed = true;

            console.log("videoElement", this.uid, "played");

            if (this._isPreLoading) {
                console.log("videoElement", this.uid, "keep preloading");
                this._keepingPreloadPlaying = true;
                return;
            }

            this.setCurrentSeconds(seekTo, true);

            this.trapPlay();

            if (this.model.get("_mute") || this._isMuted) this.videoElement.setVolume(0);

            if (this.model.get('_alwaysShowControls')) {
                this.videoElement.player.showControls();
                this.$(".mejs-controls").css("display", "block");
            }
        },

        trapPlay: function() {
            var promise = this.videoElement.play();

            if (!promise) {
                console.log("promises not supported on video.play");
            } else {
                promise.catch(function(e) {
                    console.log("promise caught")
                }).then(function(e) {
                    console.log("promise played")
                });
            }

        },

        setCurrentSeconds: function(seekTo) {
            //console.log("setCurrentSeconds");
            if (!this.videoElement) return;
            if (seekTo === undefined) return;
            if (!this._hasTimeBeenSet ||
                this._hasTimeBeenSet.flag) {
                this._hasTimeBeenSet = {
                    flag: false,
                    seekTo: seekTo
                };
            } else {
                seekTo = this._hasTimeBeenSet.seekTo;
            }
            var paused = this.videoElement.player.media.paused;

            try {
                this.videoElement.player.setCurrentTime(seekTo);
            } catch(e) {};
        },

        pause: function() {
            if (this.superTimer) {
                clearInterval(this.superTimer);
                this.superTimer = null;
            }
            if (!this.videoElement) return;
            //console.log("videoElement", this.uid, "paused");
            this.videoElement.pause();
            if ($("html").is(".iPhone")) {
                this.$("video")[0].webkitExitFullScreen();
            }
        },

        mute: function() {
            if (!this.videoElement) return;
            this._isMuted = true;
            this.videoElement.setVolume(0);
        },

        unmute: function() {
            if (!this.videoElement) return;
            this._isMuted = false;
            this.videoElement.setVolume(1);
        },

        isPaused: function() {
            if (!this.videoElement) return;
            return this.videoElement.paused;
        },

        getVolume: function() {
            if (!this.videoElement) return;
            return this.videoElement.volume;
        },

        setVolume: function(int) {
            if (!this.videoElement) return;
            this.videoElement.setVolume(int);
        },

        hasVolume: function() {
            return true;
        },

        remove: function() {
            if (this.isRemoved) return;

            if ($.fn.inlinevideo.isiPad) {
                if (this.$("video")[0].poolUid !== undefined) {
                    tagpool.push(this.$("video"));
                    this.$("video")[0].src="";
                    this.$("video").children().remove();
                    //console.log("pooling", this.$("video")[0].poolUid);
                }               
            }

            this.videoElement.player.remove();
            if (this.videoElement) {
                $(this.videoElement.pluginElement).remove();
                delete this.videoElement;
            }
            Track.prototype.remove.call(this);
        },

        onPlayerReady: function (videoElement, domObject) {
            //console.log("videoElement", this.uid, "player ready");

            this.videoElement = videoElement;

            if (!this.videoElement.player) {
                this.videoElement.player =  mejs.players[this.$('.mejs-container').attr('id')];
            }

            if (this.model.get('_alwaysShowControls')) {
                this.videoElement.player.showControls();
                this.$(".mejs-controls").css("display", "block");
            }

            //fix to force captions
            var player = this.videoElement.player;
            if (player.selectedTrack === null) {
                player.captionsButton.off("click");
                var lang = "en";
                if (player.tracks.length > 0) {
                    lang = player.tracks[0].srclang
                } else {
                    lang = 'none';
                }
                player.setTrack(lang);
            }

            this.setupEventListeners();

            this.$(".mejs-container").addClass("iv-background-color");

            this.trigger("ready", this);

            
            $(this.videoElement).on("stalled invalid error abort", function(e) {
                console.log("videoElement", this.uid, "player ", e.type);
            });
        },

        resize: function() {
            if (!this.videoElement || !this.videoElement.player) return;
            this.videoElement.player.setControlsSize();
        },

        preload: function(seconds) {
            if (this._isPreLoaded) return;
            console.log("videoElement", this.uid, "preloading");
            this._isPreLoading = true;
            this.videoElement.setVolume(0);
            try {
                this.videoElement.setCurrentTime(seconds || 0);
            } catch(e) {};
            this.trapPlay();
            this.videoElement.setVolume(0);
        }

    },{
        trackName: "videoElement",
        template: "videoElement"
    });

    
    Track.loaded(MediaElementTrackView);

    return MediaElementTrackView;

});
