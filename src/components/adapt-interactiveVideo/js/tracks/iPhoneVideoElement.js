define([
    "../track",
], function(Track) {

    var uid = 0;

    var tagpool = [];
    var poolUid = 0;
    var attributes = [ "preload", "poster", "width", "height", "style", "src", "controls", "loop" ];

    var MediaElementTrackView = Track.extend({

        renderOnChange: false,
        volume: 1,

        className: function() {
            return "inlinemediaelement-widget a11y-ignore-aria";
        },

        postInitialize: function(options) {
            this.interactivevideo = options.interactivevideo;
            this.parent = options.parent;
            this.uid = uid++;
        },

        active: function(value) {},

        preRender: function(isFirstRender) {
            if (!isFirstRender) return;

            var speed = "fast";
            if (window.speedtest) speed = speedtest.low_name;
            var isiPhone = $.fn.inlinevideo.isiPhone;
            var isiOS = $.fn.inlinevideo.isiOS;
            if (isiPhone || isiOS) {
                console.log("Forcing low quality videos");
                speed = "slow";
            }

            this.state.set("speed", speed);
        },

        postRender: function(isFirstRender) {
            if (!isFirstRender) return;


            if (tagpool.length > 0) {
                this.fromPool = true;
                var $reused = tagpool.pop();
                console.log("not fresh", $reused);
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

            this.setupPlayer();
        },

        setupPlayer: function() {

            var modelOptions = {};
            modelOptions.success = _.bind(this.onPlayerReady, this);
            modelOptions.showScrubBar = true;

            // create the player
            this.$('video').inlinevideo(modelOptions);
        },

        setupEventListeners: function() {
            $(this.videoElement).on("play", _.bind(this.onEventFired, this));
            $(this.videoElement).on("pause", _.bind(this.onEventFired, this));
            $(this.videoElement).on("ended", _.bind(this.onEventFired, this));
            $(this.videoElement).on('timeupdate', _.bind(this.onEventFired, this));
        },

        onEventFired: function(e) {
            if (this.isRemoved) return;
            switch (e.type) {
            case "timeupdate":
                var currentSeconds = Math.ceil(this.videoElement.currentTime*10)/10;
                if (this.triggerSeconds !== currentSeconds) {
                    //console.log("seconds iPhoneVideoElement", this.uid, currentSeconds);
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
            this.interactivevideo.globalMediaStop();
            if (this.$("video")[0].poolUid === undefined) {
                this.$("video")[0].poolUid = poolUid++;
            }
            this.setCurrentSeconds(seekTo);
            this.hasPlayed = true;
            this.videoElement.play();
        },

        setCurrentSeconds: function(seekTo) {
            this.videoElement.setCurrentTime(seekTo);
        },

        pause: function() {
            this.videoElement.pause()
        },

        mute: function() {
            this._isMuted = true;
            this.videoElement.setVolume(0);
        },

        unmute: function() {
            this._isMuted = false;
            this.videoElement.setVolume(1);
        },

        isPaused: function() {
            return this.videoElement.paused;
        },

        getVolume: function() {
            return this.volume;
        },

        setVolume: function(int) {
            this.volume = int;
            if (this.volume < 1) this.volume = 0;
            if (this.volume >= 1) this.volume = 1;
            this.videoElement.setVolume(this.volume);
        },

        remove: function() {
            if (this.$("video")[0].poolUid !== undefined) {
                tagpool.push(this.$("video"));
                //console.log("pooling", this.$("video")[0].poolUid);
            }

            if (this.videoElement) {
                this.videoElement.destroy();
                $(this.videoElement).remove();
                delete this.videoElement;
            }
            Track.prototype.remove.call(this);
        },

        onPlayerReady: function (videoElement) {
            this.videoElement = videoElement;

            this.setupEventListeners();

            this.trigger("ready", this);
        },

        resize: function() {
            if (!$("html").is(".in-fullscreen-view")) return;

            if ($.fn.inlinevideo.isiPhone) {
                setTimeout(function () { window.scrollTo(0, 0); window.scrollTo(0, 100); }, 1000);
            }
        },

        preload: function(seconds) {
            //console.log("preloading", this.uid);
            this._isPreLoading = true;
            this.videoElement.setVolume(0);
            this.once("play", function() {
                //console.log("preloaded", this.uid);
                this._isPreLoading = false;
                this._isPreLoaded = true;
                if (!this._keepingPreloadPlaying) {
                    this.videoElement.pause();
                    this.videoElement.setCurrentTime(seconds);
                }
                this.videoElement.setVolume(1);
                this.trigger("preloaded");
            });
            if (this._keepingPreloadPlaying) {
                this.videoElement.setCurrentTime(seconds);
                this.videoElement.play();
            } else {
                this.videoElement.play();
            }
        },

        hasVolume: function() {
            return false;
        }

    },{
        trackName: "iPhoneVideoElement",
        template: "iPhoneVideoElement"
    });

    Track.loaded(MediaElementTrackView);

    return MediaElementTrackView;

});
