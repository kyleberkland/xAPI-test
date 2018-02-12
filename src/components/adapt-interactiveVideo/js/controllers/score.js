define([
    "../controller",
    "./score/scoreObject"
], function(Controller, ScoreObject) {

    var Score = Controller.extend({

        postInitialize: function(options) {
            var scoreObj = new ScoreObject({
                parent: this
            });
            this.model.set("score", scoreObj);
            this.state.set("score", scoreObj);
            
            _.defer(_.bind(function() {

                for (var i = 0, l = this.controllers.length; i < l; i++) {
                    var controller = this.controllers[i];
                    controller.scoreInitialize();
                }

                for (var i = 0, l = this.trackViews.length; i < l; i++) {
                    var trackView = this.trackViews[i];
                    trackView.scoreInitialize();
                }

                var liveSprites = this.state.get("liveSprites");
                for (var k in liveSprites) {
                    liveSprites[k].scoreInitialize();
                }

            }, this));
        },

        change: function() {
            for (var i = 0, l = this.controllers.length; i < l; i++) {
                var controller = this.controllers[i];
                controller.scoreChange();
            }

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
            if (!score) return;
            if (!scoreToPass) return;
            if (score < scoreToPass) return;
            this.parent.complete(this, score, scoreToPass);
        }

    });

    Controller.loaded(Score);

    return Score;

});
