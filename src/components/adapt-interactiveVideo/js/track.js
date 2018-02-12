define([
    "./utils/diffView",
    "./global"
], function(DiffView) {

    //triggers
    /*
        finish
        play
        ready
        seconds
    */

    var TrackView = DiffView.extend({

        initialize: function(options) {
            this.interactivevideo = options.interactivevideo;
            DiffView.prototype.initialize.apply(this, arguments);
        },

        prepare: function() {},

        active: function() {},

        scoreInitialize: function() {},

        scoreChange: function() {},

        flagInitialize: function() {},

        stateChange: function() {},

        backgroundClick: function() {},

        resize: function() {},

        play: function(seekTo) {},

        setCurrentSeconds: function(seekTo) {},

        pause: function() {},

        mute: function() {},

        unmute: function() {},

        isPaused: function() {},

        getVolume: function() {},

        setVolume: function(int) {},

        hasVolume: function() {
            return false;
        },

        debrief: function() {}

    }, {

        loaded: function(TrackPrototype) {
            InteractiveVideo.on("register", TrackPrototype.register, TrackPrototype);
        },

        register: function() {
            InteractiveVideo.register("track", this.trackName, this);
        }

    });

    return TrackView;

});
