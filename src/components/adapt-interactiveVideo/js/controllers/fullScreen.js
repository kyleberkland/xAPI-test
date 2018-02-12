define([
    "../controller",
    "./fullScreen/FullScreenViewExtension"
], function(Controller, FullScreenViewExtension) {

    var FullScreenView = Controller.extend({

        isFullScreenAlwaysInWindow: false,

        postInitialize: function(options) {

            this.scrollToTop = _.debounce(_.bind(this.scrollToTop,this), 500);

            this.container = this.$el;

            if (this.model.get("_config")._alwaysFullWindow) {
                this.$el.removeClass("in-window");
                this.state.set("isFullWindow", true);
                this.isAlwaysFullWindow = true;
            } else {
                this.$el.addClass("in-window");
                this.state.set("isFullWindow", false);
                this.isAlwaysFullWindow = false;
            }

            this.setupFullScreen();

            this.state.set("isFullScreenAllowed", this.isFullScreenAllowed);
        },

        setUpEventListeners: function(options) {
            this.listenTo(this, {
                "enteredfullscreen": this.onEnteredFullscreen,
                "exitedfullscreen": this.onExitedFullscreen,
            }, this);
        },

        onEnteredFullscreen: function() {
            if (!this.model.get("_config")._alwaysFullWindow) {
                this.$el.removeClass("in-window");
                this.state.set("isFullWindow", true);

            }
            this.state.set("isFullScreen", true);


            var liveSprites = this.state.get("liveSprites");
            for (var k in liveSprites) {
                liveSprites[k].fullScreenIn();
            }

            this.resizeAfterRender();
        },

        onExitedFullscreen: function() {
            if (!this.model.get("_config")._alwaysFullWindow) {
                this.$el.addClass("in-window");
                this.state.set("isFullWindow", false);
            }
            this.state.set("isFullScreen", false);

            var liveSprites = this.state.get("liveSprites");
            for (var k in liveSprites) {
                liveSprites[k].fullScreenOut();
            }

            this.resizeAfterRender();

            this.scrollToTop();
        },

        scrollToTop: function() {
            $(window).scrollTo((this.$el.offset().top-$(".navigation").outerHeight())+"px");
        },

        fullScreenToggle: function() {
            if (this.isFullScreen) {
                this.exitFullScreen();
            } else {
                this.enterFullScreen();
            }
        },

        change: function() {
            for (var i = 0, l = this.controllers.length; i < l; i++) {
                var controller = this.controllers[i];
                controller.stateChange();
            }

            for (var i = 0, l = this.trackViews.length; i < l; i++) {
                var trackView = this.trackViews[i];
                trackView.stateChange();
            }

            var liveSprites = this.state.get("liveSprites");
            for (var k in liveSprites) {
                liveSprites[k].stateChange();
            }
        },

        resizeAfterRender: function() {
            this.parent.once("postRender", _.bind(function() {
                _.defer(_.bind(function() {
                    this.parent.resize();
                    this.change();
                }, this));
            }, this));
        }

    });

    FullScreenViewExtension.extend(FullScreenView.prototype);

    Controller.loaded(FullScreenView);

    return FullScreenView;

});
