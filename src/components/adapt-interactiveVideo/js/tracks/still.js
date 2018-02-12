define([
    "../track",
    "./iPhoneVideoElement",
    "./videoElement"
], function(Track, IPhoneVideoElement, VideoElement) {

    var uid = 0;

    var StillView = Track.extend({

        renderOnChange: false,

        seconds: 0,
        triggerSeconds: 0,
        _isPaused: true,
        _isPlayTriggered: false,
        _hasSecondsTriggered: false,
        timeAtPlay: 0,
        _playPauseLock: 0,
        _isActive: false,
        uid: null,

        video: null,

        className: function() {
            return "still-widget a11y-ignore-aria";
        },

        postInitialize: function(options) {
            this.parent = options.parent;
            this.interactivevideo = options.interactivevideo;
            this.uid=uid++;
        },

        active: function(value) {
            if (!this.videoElement) return;

            if (!value) {
                if (!this._isActive) return;
                this._isActive = false;
                this.videoElement.pause();
                _.delay(_.bind(function() {
                    if (!this.videoElement.isPaused()) return;
                    this.videoElement.setCurrentSeconds(0);
                }, this), 2000);
            }
        },

        preload: function() {
            this._isPreLoading = true;
            if (this.videoElement) {
                this.videoElement.setVolume(0);
                this.listenToOnce(this.videoElement, "preloaded", function() {
                    this._isPreLoading = false;
                    this._isPreLoaded = true;
                    this.trigger("preloaded");
                }, this)
                this.videoElement.preload(0);

            } else {
                _.defer(_.bind(function() {
                    this._isPreLoading = false;
                    this._isPreLoaded = true;
                    this.trigger("preloaded");
                }, this));
            }
        },

        onTick: function() {
            if (this._isPaused) {
                this._isPlayTriggered = false;
                this._hasSecondsTriggered = false;
                clearInterval(this.timer);
                this.timer = null;
                return;
            }

            var now = (new Date()).getTime();
            this.seconds += ((now - this.timeAtPlay) / 1000);
            this.timeAtPlay = now;

            if (!this._isPlayTriggered) return;

            var currentSeconds = this.seconds;
            var lengthSeconds = parseFloat(this.model.get("_seconds")) || 0;
            if (currentSeconds >= lengthSeconds) {
                //console.log("end tick");
                this.triggerSeconds = lengthSeconds;
                currentSeconds = lengthSeconds;
                this.trigger("seconds", this, lengthSeconds);
                //console.log("seconds still", this.uid, lengthSeconds);
                this._hasSecondsTriggered = true;
                this.pause();
                this.trigger("finish", this);
                return;
            }

            if (this.triggerSeconds !== currentSeconds) {
                //console.log("tick", currentSeconds);
                this.trigger("seconds", this, currentSeconds);
                //console.log("seconds still", this.uid, currentSeconds);
                this.triggerSeconds = currentSeconds
                this._hasSecondsTriggered = true;
                return;
            }

        },

        preRender: function(isFirstRender) {
        },

        postRender: function(isFirstRender) {
            if (!isFirstRender) return;
            this.$el.imageready(_.bind(function(){
                this.resize();
                this.trigger("ready", this);
            }, this));

            if (this.model.get("_alternateTimeline") && this.model.get("_type") === "track:video") {
                if ($.fn.inlinevideo.isiPhone && $.fn.inlinevideo.version < 10) {
                    ViewClass = IPhoneVideoElement;
                } else {
                    ViewClass = VideoElement;
                }
                this.videoElement = new ViewClass({
                    model: this.model,
                    parent: this.parent,
                    interactivevideo: this.interactivevideo
                });
                this.$(".still-inner").append(this.videoElement.$el);
            }
        },

        resize: function() {
            
        },

        play: function(seekTo) {
            this.interactivevideo.globalMediaStop();
            if (this.videoElement) {
                this.videoElement.play();
            }
            if (seekTo !== undefined) {
                this.seconds = seekTo;
                this.timeAtPlay = (new Date()).getTime();
            }
            if (this.awaitingBackgroundPlay) {
                this.triggerPlayWhenDone = true;
                return;
            } else {
                this.triggerPlayWhenDone = false;
            }

            this._isPlayTriggered = false;
            this._hasSecondsTriggered = false;
            this._isPaused = false;
            _.defer(_.bind(function() {
                if (this._isPaused) return;
                if (this._isPlayTriggered) return;
                this._isPlayTriggered = true;
                this.trigger("play", this);
                if (!this.timer) {
                    this.timer = setInterval(_.bind(this.onTick, this), 250);
                    this.timeAtPlay = (new Date()).getTime();
                }
            }, this));
        },

        setCurrentSeconds: function(seekTo) {
            //todo: do this logic
            debugger;
        },

        pause: function() {
            this._togglePlay = null;
            this._isPaused = true;
            this._isPlayTriggered = false;
            this._hasSecondsTriggered = false;
            this.awaitingBackgroundPlay = false;
            this.triggerPlayWhenDone = false;
            clearInterval(this.timer);
            this.timer = null;
            _.defer(_.bind(function() {
                if (!this._isPaused) return;
                this.trigger("pause", this);
            }, this))
        },

        mute: function() {

        },

        unmute: function() {

        },

        isPaused: function() {
            return this._isPaused;
        },

        getVolume: function() {
            return 1;
        },

        setVolume: function(int) {

        },

        prepare: function() {
            if (!this.videoElement) return;
            this.awaitingBackgroundPlay = true;
            this.triggerPlayWhenDone = false;
            //console.log("playing still background", this.uid);
            this.videoElement.setCurrentSeconds(0);
            this.videoElement.play(0);
            this.listenToOnce(this.videoElement, "seconds", function() {
                this.playSatisfy();
            }, this);
        },

        playSatisfy: function() {
            this.awaitingBackgroundPlay = false;
            if (this.triggerPlayWhenDone) {
                this.play();
            }
            this.triggerPlayWhenDone = false;
        },

        debrief: function() {
            if (!this.videoElement) return;

            this.videoElement.pause();
        }

    },{
        trackName: "still",
        template: "still"
    });

    Track.loaded(StillView);


    return StillView;

});
