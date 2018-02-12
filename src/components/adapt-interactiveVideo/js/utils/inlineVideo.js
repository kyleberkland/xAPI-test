'use strict';

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                // require('jQuery') returns a factory that requires window to
                // build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop
                // if it's defined (how jquery works)
                if ( typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                }
                else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    if ($.fn.inlinevideo) return;

    //RAF
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (function() {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function( callback, element ) {
                    return window.setTimeout( callback, 1000 / 60 );
                };
        })();
    }
    if (!window.cancelRequestAnimationFrame) {
        window.cancelRequestAnimationFrame = (function() {
            return window.webkitCancelRequestAnimationFrame ||
                window.mozCancelRequestAnimationFrame ||
                window.oCancelRequestAnimationFrame ||
                window.msCancelRequestAnimationFrame ||
                clearTimeout;
        })();
    }

    var extend = function(a,b) {
        for (var k in b) {
            a[k] = b[k];
        }
        return a;
    };

    //APPLE iPhone/iOS Detection
    var APPLE_DETECTION = {
        initialize: function() {
            this.ua = window.navigator.userAgent.toLowerCase();
            this.isAndroid = (this.ua.match(/android/i) !== null);
            this.isiPad = (this.ua.match(/ipad/i) !== null);
            this.isiPhone = (this.ua.match(/iphone/i) !== null);
            this.isBlackBerry10 = (this.ua.match(/bb10/i) !== null);
            this.isiOS = this.isiPhone || this.isiPad;
            this.version = parseFloat(
                ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(this.ua) || [0,''])[1])
                .replace('undefined', '3_2').replace('_', '.').replace('_', '')
            ) || false;
            delete this.initialize;

            if (APPLE_DETECTION.test) {
                APPLE_DETECTION.isAndroid = true;
                // APPLE_DETECTION.isiPhone = true;
                // APPLE_DETECTION.version = 9;
            }
        }

    };

    //INLINE VIDEO ELEMENT
    window.InlineVideo = function InlineVideo(videoElement, options) {
        var inlineVideoElement = document.createElement('inlinevideo');
        inlineVideoElement._videoElement = videoElement;
        $.extend(inlineVideoElement, InlineVideo.prototype);
        return InlineVideo.initialize.call(inlineVideoElement, options);
    };

    var uid = 0;

    extend(InlineVideo, {

        initialize: function(options) {
        
            this._uid = uid++;
            this._wasPlayClicked = false;
            this._lastTime = 0;
            this._lastTriggerTime = 0;
            this._videoElement.playbackRate = 2;
            
            // replace the video with inlineVideo element
            $(this).addClass('inlinevideocontainer');
            $(this._videoElement).addClass("inlined").replaceWith(this).removeAttr("style");
            $(this._videoElement).removeAttr("controls");
            this._$ = $(this);
            this._$.append(this._videoElement);

            if (options.mute) this.volume = 0;

            this._audioElem = document.createElement('audio');
            $(this._audioElem).removeAttr("controls");
            $(this._audioElem).attr("loop", $(this._videoElement).attr("loop"));
            $(this._audioElem).attr("mute", $(this._videoElement).attr("mute"));
            this._audioElem.src = $(this._videoElement).find("source[type='video/mp4']").attr("audio");

            var player = [this._audioElem];
            this._$.append(player);

            var __ = this;

            this._videoElement.onloadstart = function() {

            }; // fires when the loading starts
            this._videoElement.onloadedmetadata = function() { 

                __._metaLoaded = true;
                if (__._wasPlayClicked) {
                    //if meta is loaded with play click
                    __._isLoaded = true;
                    if (__.paused) return;
                    __.play();
                }

            }; //  when we have metadata about the video
            this._videoElement.onloadeddata = function() {

            }; // when we have the first frame
            this._videoElement.onprogress = function() { 

                if (!__._isLoaded) return;
                var end = __._videoElement.buffered.end(0);
                var sofar = parseFloat(((end / __._videoElement.duration) * 100));

                //add waiting icon in here
            };

            this.options = options || {};
            if (this.options.showScrubBar) {
                InlineVideo.showScrubBar.call(this);
            }

            $.fn.inlinevideo.players[this._uid] = this;

            return this;
        },

        playLoop: function() {
            var __ = this;
            var time = Date.now();
            var elapsed = (time - this._lastTime) / 1000;
            var loop = $(this._videoElement).attr("loop");

            if (this._isDestroyed) return;

            if (this.currentTime === undefined) this.currentTime = 0;

            var currentTime = this.currentTime + elapsed;

            // render
            if (elapsed >= (1/25)) {
                var outByTime = Math.abs(this._audioElem.currentTime - currentTime);
                if (outByTime > 1) {
                    //skip audio if out of sync
                    this._audioElem.currentTime = currentTime;
                }
            }

            // if we are at the end of the video stop
            //var currentTime = (Math.round(parseFloat(this._videoElement.currentTime)*10000)/10000);
            var duration = (Math.round(parseFloat(this._videoElement.duration)*10000)/10000);
            
            if (loop && currentTime >= duration) {
                this._audioElem.currentTime = 0;
                this._videoElement.currentTime = 0;
                this._lastTime = time;
                this.currentTime = 0;
                currentTime = 0;
            } else if (currentTime <= duration - 0.1) {

                //seek video
                if (elapsed >= (1/25)) {
                    this._videoElement.currentTime = currentTime;
                    this._lastTime = time;
                    this.currentTime = currentTime;
                }
            }

            var triggerElapsed = (time - this._lastTriggerTime) / 1000;
            if (triggerElapsed >= 1/4) {
                setTimeout(function() {
                    $(__).triggerHandler("timeupdate");
                    InlineVideo.updateScrubBar.call(__);
                }, 0);
                this._lastTriggerTime = time;
                this.currentTime = currentTime;
            }

            if (currentTime >= duration && !loop) {
                this.pause();
                this.currentTime = currentTime;
                $(this).triggerHandler("ended");
                InlineVideo.updateScrubBar.call(__);
                return;
            }

            this._animationRequest = requestAnimationFrame(function() {
                if (__._isDestroyed) return;
                InlineVideo.playLoop.call(__);
            });
        }

    });

    extend(InlineVideo.prototype, {

        volume: 1,

        paused: true,

        play: function(e) { 
            //console.log("played");
            //can only be run from click
            this._wasPlayClicked = true;

            if (this._metaLoaded && !this._isLoaded) {
                //if meta loaded but play not clicked
                this._videoElement.play();
                this._videoElement.pause();
                this._videoElement.currentTime = 0;
                this._isLoaded = true;
            }

            if (!this._isLoaded) {
                //meta not captured on startup, load meta data
                this._videoElement.load();

                //mske sure to play the audio on click
                if (this._audioElem.networkState !== 3 && this.volume !== 0) {
                    this._audioElem.currentTime = 0;
                    this._audioElem.play();
                    this._audioElem.pause();
                    this._audioElem.currentTime = 0;
                }
                this.paused = false;
                return;
            }

            this._lastTime = Date.now();
            var duration = (Math.round(parseFloat(this._videoElement.duration)*10000)/10000);
            if (this.currentTime >= duration) {
                this.currentTime = 0;
                this._videoElement.currentTime = 0;
                if (this._audioElem.networkState !== 3) {
                    this._audioElem.currentTime = 0;
                }
            }

            var __ = this;
            if (this._audioElem.networkState !== 3 && this.volume !== 0) {
                this._audioElem.play();
            }
            
            this._animationRequest = requestAnimationFrame(function() {
                InlineVideo.playLoop.call(__);
            });

            setTimeout(function() {
                __.paused = false;
                $(__).triggerHandler("play")
            }, 0);

        },

        pause: function() {
           // console.log("paused");
            cancelAnimationFrame(this._animationRequest);
            this._animationRequest = null;
            if (this._audioElem.networkState !== 3) {
                this._audioElem.pause();
            }
            this.paused = true;
            var __ = this;
            setTimeout(function() {
                $(__).triggerHandler("pause")
            }, 0);
        },

        setCurrentTime: function(seconds) {
            if (seconds === undefined) return;
            this._videoElement.currentTime = seconds;
            if (this._audioElem.networkState !== 3) {
                this._audioElem.currentTime = seconds;
            }
            this._lastTime = Date.now();
            this.currentTime = seconds;
        },

        mute: function() {
            this.volume = 0;
            if (this._audioElem.networkState !== 3) {
                this._audioElem.pause();
            }
        },

        unmute: function() {
            this.volume = 1;
            if (!this.paused) {
                if (this._audioElem.networkState !== 3) {
                    this._audioElem.play();
                }
            }
        },

        isPaused: function() {
            return this.paused;
        },

        getVolume: function() {
            return this.volume;
        },

        setVolume: function(int) {
            if (int < 1) this.volume = 0;
            if (int >= 1) this.volume = 1;
            if (this.volume === 0) {
                if (this._audioElem.networkState !== 3) {
                    this._audioElem.pause();
                }
            }
        },

        destroy: function() {
            this._isDestroyed = true;
            $(this._videoElement).removeClass("inlined");
            InlineVideo.removeScrubBar.call(this);
            delete $.fn.inlinevideo.players[this._uid];
        }

    });

    extend(InlineVideo, {

        _scrubBar: '<div class="inlinevideo-scrub-bar"><div class="outer"><div class="inner" style="width:0px;"></div></div></div>',

        showScrubBar: function() {
            this._$scrubBar = $(InlineVideo._scrubBar);
            $(this).append(this._$scrubBar);
            //.find(".container")
            this._$scrubBar.attr("data-player", this._uid).on("click", InlineVideo.clickScrubBar);
        },

        clickScrubBar: function(e) {
            e.preventDefault();
            e.stopPropagation();

            var $container = $(e.currentTarget);

            var playerid = $container.attr("data-player");
            var player = $.fn.inlinevideo.players[playerid];

            var position = $container.offset();
            var clientX = e.clientX;
            switch (e.type) {
            case "touchstart":
            case "touchmove":
            case "touchend":
                if (e.originalEvent.changedTouches) {
                    clientX = e.originalEvent.changedTouches[0].clientX;
                } else {
                    clientX = e.originalEvent.layerX;
                }
            }

            var leftPX = (clientX - position.left);
            var barWidth = $container.width();

            var markSeconds = player._videoElement.duration;
            var passedSeconds = player.currentTime;

            var gotoSeconds = (leftPX/barWidth) * markSeconds;

            player.setCurrentTime(gotoSeconds);
        },

        updateScrubBar: function() {
            if (!this._$scrubBar) return;
            var width = (100 / this._videoElement.duration) * this._videoElement.currentTime;
            this._$scrubBar.find(".inner").css("width", width+"%");
        },

        removeScrubBar: function() {
            if (!this._$scrubBar) return;
            //.find(".container")
            this._$scrubBar.off("click", InlineVideo.clickScrubBar);
        }

    });

    extend(InlineVideo.prototype, {

        _$scrubBar: null

    });

    //Inline video styling
    var injectStyling = function() {
        //hide user controls
        if(!$("style.inlinevideo").length) {
            var css = [
                ".inlinevideo-scrub-bar { position: absolute; top:auto; bottom: 0; left: 0; right: 0; height: 28px; }",
                ".inlinevideo-scrub-bar .outer { opacity: 1; transition: opacity 1s; -webkit-transition: opacity 1s; background: black; position: absolute; top: 0; left: 0; padding: 9px 5px; bottom: 0; right: 0; }",
                //".inlinevideo-scrub-bar .container { height:100%; background: #333; background: rgba(50, 50, 50, 0.8); background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(rgba(30, 30, 30, 0.8)), to(rgba(60, 60, 60, 0.8))); background: -webkit-linear-gradient(top, rgba(30, 30, 30, 0.8), rgba(60, 60, 60, 0.8)); background: -moz-linear-gradient(top, rgba(30, 30, 30, 0.8), rgba(60, 60, 60, 0.8)); background: -o-linear-gradient(top, rgba(30, 30, 30, 0.8), rgba(60, 60, 60, 0.8)); background: -ms-linear-gradient(top, rgba(30, 30, 30, 0.8), rgba(60, 60, 60, 0.8)); background: linear-gradient(rgba(30, 30, 30, 0.8), rgba(60, 60, 60, 0.8)); border-radius: 2px; cursor: pointer; }",
                ".inlinevideo-scrub-bar .inner {background: #fff; background: rgba(255, 255, 255, 0.8); background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(rgba(255, 255, 255, 0.9)), to(rgba(200, 200, 200, 0.8))); background: -webkit-linear-gradient(top, rgba(255, 255, 255, 0.9), rgba(200, 200, 200, 0.8)); background: -moz-linear-gradient(top, rgba(255, 255, 255, 0.9), rgba(200, 200, 200, 0.8)); background: -o-linear-gradient(top, rgba(255, 255, 255, 0.9), rgba(200, 200, 200, 0.8)); background: -ms-linear-gradient(top, rgba(255, 255, 255, 0.9), rgba(200, 200, 200, 0.8)); background: linear-gradient(rgba(255, 255, 255, 0.9), rgba(200, 200, 200, 0.8)); width:0%; height:100%; }",
                "inlinevideo { display:inline-block; position:relative; } inlinevideo video {width:100%;height:auto;} inlinevideo audio {display:none;} video.inlined::-webkit-media-controls {display: none !important;} video.inlined::-webkit-media-controls-start-playback-button { display: none !important;-webkit-appearance: none;}"
            ];

            $("head").append("<style class='inlinevideo'>"+css.join(" ")+"</style>");
        }
    };

    $.fn.inlinevideo = function(options) {
        if (!((APPLE_DETECTION.isiPhone && APPLE_DETECTION.version > 8) || true)) return false;
        
        var $this = $(this);
        var $items = $([]);

        $items = $items.add($this.find("video:not(.inlined)"));
        $items = $items.add($this.filter("video:not(.inlined)"));

        $items.each(function(index, item) {

            injectStyling();
            
            $(item).addClass("inlinevideo");

            var inlineVideo = new InlineVideo(item, options);
            if (typeof options.success === "function") options.success(inlineVideo, options);

        });



        return true;
    };
    $.fn.inlinevideo.players = {};

    APPLE_DETECTION.test = false;
    APPLE_DETECTION.initialize();

    extend($.fn.inlinevideo, APPLE_DETECTION);

}));
