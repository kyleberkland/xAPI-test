define([
    "../../utils/diffView"
], function(DiffView) {

    var mep_defaults = {
        "poster": "",
        "showPosterWhenEnded": false,
        "defaultVideoWidth": 480,
        "defaultVideoHeight": 270,
        "videoWidth": -1,
        "videoHeight": -1,
        "defaultAudioWidth": 0,
        "defaultAudioHeight": 0,
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
        "alwaysShowControls": false,
        "hideVideoControlsOnLoad": true,
        "clickToPlayPause": false,
        "iPadUseNativeControls": false,
        "iPhoneUseNativeControls": false,
        "AndroidUseNativeControls": false,
        "features": [],
        "isVideo": true,
        "enableKeyboard": true,
        "pauseOtherPlayers": false,
        "startLanguage": "",
        "tracksText": "",
        "hideCaptionsButtonWhenEmpty": true,
        "toggleCaptionsButtonWhenOnlyOne": false,
        "slidesSelector": ""
    };

    var uid = 0;

    var AudioElement = DiffView.extend({

        renderOnChange: false,

        className: function() {
            return "mediaelement-widget a11y-ignore-aria";
        },

        postInitialize: function(options) {
            this.parent = options.parent;
            this.uid = uid++;
        },

        preRender: function(isFirstRender) {
            if (!isFirstRender) return;

            var speed = "fast";
            if (window.speedtest) speed = speedtest.low_name;

            this.state.set("speed", speed);
        },

        postRender: function(isFirstRender) {
            if (!isFirstRender) return;
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

            this.addMediaTypeClass();

            // create the player
            this.$('audio').mediaelementplayer(modelOptions);

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
        },

        onEventFired: function(e) {
            if (this.isRemoved) return;
            //console.log("normal", e.type, e);
            if (this._isPreLoading) {
                if (e.type === "play") {
                    //console.log("preloading", e.type, e);
                    this.videoElement.pause();
                    this._isPreLoading = false;
                    this._isPreLoaded = true;
                    this.trigger("preloaded", this);
                }
                return;
            }
            switch (e.type) {
            case "timeupdate":
                var currentSeconds = Math.ceil(this.videoElement.currentTime*10)/10;
                if (this.triggerSeconds !== currentSeconds) {
                    //console.log("seconds audioElement", this.uid, currentSeconds, this.videoElement.volume);
                    this.trigger("seconds", this, currentSeconds);
                    this.triggerSeconds = currentSeconds
                }
                break;
            case "ended":
                this.trigger("finish", this);
                break;
            case "play":
                this.trigger("play", this);
                break;
            case "pause":
                this.trigger("pause", this);
                break;
            default:
                debugger;
            }
        },

        play: function(seekTo) {
            if (!this.videoElement) return;
            if (!this._isMuted) this.videoElement.setVolume(1);
            if (seekTo !== undefined) this.setCurrentSeconds(seekTo);
            //console.log("audioElement", this.uid, "played");
            this.videoElement.play();
            this.hasPlayed = true;
        },

        setCurrentSeconds: function(seekTo) {
            if (!this.videoElement) return;
            if (seekTo === undefined) return;
            this.videoElement.setCurrentTime(seekTo);
        },

        pause: function() {
            if (!this.videoElement) return;
            this.videoElement.pause();
            //console.log("audioElement", this.uid, "paused");
            this.videoElement.paused = true;
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

        hasVolume: function() {
            return true;
        },

        getVolume: function() {
            if (!this.videoElement) return;
            return this.videoElement.volume;
        },

        setVolume: function(int) {
            if (!this.videoElement) return;
            this.videoElement.setVolume(int);
            this.videoElement.volume = int;
        },

        remove: function() {
            if (this.videoElement) {
                $(this.videoElement.pluginElement).remove();
                delete this.videoElement;
            }
            DiffView.prototype.remove.call(this);
        },

        onPlayerReady: function (videoElement, domObject) {
            this.videoElement = videoElement;

            if (!this.videoElement.player) {
                this.videoElement.player =  mejs.players[this.$('.mejs-container').attr('id')];
            }

            this.setupEventListeners();

            this.trigger("ready", this);
        },

        preload: function(seconds) {
            if (this._isPreLoaded) {
                this.trigger("preloaded");
                return;
            }
            this.videoElement.setVolume(0);
            _.defer(_.bind(function() {
                this.videoElement.play();
                this.videoElement.pause();
                this._isPreLoading = true;
                this._isPreLoaded = false;
            }, this));
        }

    },{
        template: "audioElement"
    });

    return AudioElement;

});
