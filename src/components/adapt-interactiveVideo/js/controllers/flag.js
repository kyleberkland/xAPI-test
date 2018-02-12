define([
    "../controller",
    "./flag/flagObject"
], function(Controller, FlagObject) {

    var Flag = Controller.extend({

        postInitialize: function(options) {
            var flagObj = new FlagObject({
                parent: this
            });
            this.model.set("flag", flagObj);
            this.state.set("flag", flagObj);

            _.defer(_.bind(function() {

                for (var i = 0, l = this.trackViews.length; i < l; i++) {
                    var trackView = this.trackViews[i];
                    trackView.flagInitialize();
                }

                var liveSprites = this.state.get("liveSprites");
                for (var k in liveSprites) {
                    liveSprites[k].flagInitialize();
                }

            }, this));
        },

        change: function() {
            for (var i = 0, l = this.trackViews.length; i < l; i++) {
                var trackView = this.trackViews[i];
                trackView.scoreChange();
            }

            var liveSprites = this.state.get("liveSprites");
            for (var k in liveSprites) {
                liveSprites[k].scoreChange();
            }
        },

        complete: function(score, scoreToPass) {
            this.parent.complete(this, score, scoreToPass);
        }

    });

    Controller.loaded(Flag);

    return Flag;

});
