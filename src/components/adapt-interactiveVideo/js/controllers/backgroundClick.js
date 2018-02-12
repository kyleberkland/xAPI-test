define([
    "../controller"
], function(Controller) {

    var BackgroundClick = Controller.extend({

        setUpEventListeners: function(options) {
            this.globalPause = _.bind(this.globalPause, this);
            this.$el.on("click.delegate", this.globalPause);
        },

        globalPause: function(e) {
            
            if (!this.model.get("_allowGlobalEvents")) {
                return;
            }

            if (this.state.get("isTrackLoading")) return;
            var value = {
                _defaultPrevented: false,
                _propagationStopped: false,
                preventDefault: function() {
                    this._defaultPrevented = true;
                },
                stopPropagation: function() {
                    this._propagationStopped = true;
                }
            };

            var liveSprites = this.state.get("liveSprites");
            for (var k in liveSprites) {
                if (!liveSprites[k].allowBackgroundClick()) {
                    console.log(k, "dropped background click");
                    return
                }
            }

            for (var i = 0, l = this.trackViews.length; i < l; i++) {
                var trackView = this.trackViews[i];
                trackView.backgroundClick(value);
            }

            var liveSprites = this.state.get("liveSprites");
            for (var k in liveSprites) {
                liveSprites[k].backgroundClick(value);
            }


            if (value._propagationStopped) return;

            this.onGlobalPlayPause();
        },

        globalPlay: function() {
            if (this.state.get("isTrackLoading")) return;
            this.onGlobalPlayPause();
        },

        onGlobalPlayPause: function(e) {
            if (this.state.get("isTrackLoading")) return;
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            var currentTrackIndex = this.model.get("_currentTrackIndex");
            if (currentTrackIndex === undefined) return;

            if (this.trackViews[currentTrackIndex].play) {
                if (this.trackViews[currentTrackIndex].isPaused()) {
                    //console.log("global play");
                    this.state.set("isPlaying", true);
                    this.state.set("isContinueLocked", false);
                    this.trackViews[currentTrackIndex].play();

                    for (var i = 0, l = this.controllers.length; i < l; i++) {
                        var controller = this.controllers[i];
                        controller.mediaVolumeUp(this.trackViews[currentTrackIndex]);
                    }

                    this.waitAnimateOut({ animateOutDuration: 1000 }, function() {

                        if (!this.state.get("isPlaying")) return;
                        this.state.set("hidden", true);
                    }, this);
                } else {
                    //console.log("global pause");
                    this.state.set({
                        "isPlaying": false,
                        "hidden": false
                    });
                    this.trackViews[currentTrackIndex].pause();
                }
            }
        },

        waitAnimateOut: function(sprite, callback, context) {
            var animateOutDuration = this.disableAnimations ? 0 : 1000;
                // 0:
                // (sprite.animateOutDuration || this.defaultAnimateOutDuration);

            _.delay(_.bind(callback, context), animateOutDuration);
        }

    });

    Controller.loaded(BackgroundClick);

    return BackgroundClick;

});
