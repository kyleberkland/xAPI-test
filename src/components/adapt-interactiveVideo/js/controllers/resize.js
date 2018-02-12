define([
    "../controller"
], function(Controller) {

    var Resize = Controller.extend({

        fontSizeWidth: 860,
        isInResize: false,

        postInitialize: function() {
            var isFillWindow = this.model.get("_config")._fillWindow || false;
            this.state.set("isFillWindow", isFillWindow);

            Controller.prototype.postInitialize.apply(this, arguments);
        },

        setUpEventListeners: function(options) {
            this.onResize = _.bind(this.onResize, this);

            $(window).on("resize", this.onResize);

            this.onScroll = _.debounce(_.bind(this.onScroll, this), 17);
            $(window).on("scroll", this.onScroll);
        },

        remove: function() {
            $(window).off("resize", this.onResize);
            $(window).off("scroll", this.onScroll);
            Controller.prototype.remove.call(this);

        },

        onScroll: function() {
            this.resize();
        },

        onResize: function() {
            this.isInResize = true;
            this.resizeStage();
            this.parent.resize();
            this.isInResize = false;
        },

        resize: function() { 
            if (this.isInResize) return;
            this.resizeStage();
        },

        resizeStage: function() {
            this.resizeHTML();
            this.resizeTracks();
            this.resizeRatios();
            this.resizeSpriteContainer();
            this.resizeFonts();

            this.parent.trigger("resized");
        },

        resizeHTML: function() {
            if (!$.fn.inlinevideo.isiOS) return;

            document.querySelector("html").style.height = window.innerHeight + "px";
        },

        resizeTracks: function() {
            for (var i = 0, l = this.trackViews.length; i < l; i++) {
                this.trackViews[i].resize();
            }
        },

        resizeFonts: function() {
            var mainFontSize = parseInt(this.$el.css("font-size"));
            var fontSize;
            if (this.state.get("isWiderRatio")) {
                var trackRatio = this.state.get("trackRatio");
                var ratioWidth = (trackRatio * this.$el.height());
                fontSize = (ratioWidth / this.fontSizeWidth) * mainFontSize;
            } else {
                var fontSize = (this.$el.width() / this.fontSizeWidth) * mainFontSize;
                
            }
            if (fontSize < mainFontSize - 12) fontSize = mainFontSize - 12;
            if (fontSize < 1) fontSize = 1;
            this.state.set("fontSize", fontSize);
        },

        resizeRatios: function() {

        },

        resizeSpriteContainer: function() {
            var windowHeight = window.innerHeight;
            var windowWidth = $(window).width();

            var $sizingImg = this.$(".track:first-child .still-widget img");
            var height = $sizingImg.height();
            var width = $sizingImg.width();
            // var height = this.model.get("_config")._height;
            // var width = this.model.get("_config")._width;

            var windowRatio = windowWidth / windowHeight;
            var trackRatio = width / height;

            var isFillWindow = this.model.get("_config")._fillWindow || false;
            var isFullWindow = this.state.get("isFullWindow");
            var alwaysFullWindow = this.model.get("_config")._alwaysFullWindow || false;

            var trackContainerWidth = "";

            this.$el[isFillWindow ? "addClass" : "removeClass"]("is-fillwindow");

            if (isFullWindow) {
                var $outerContainer = this.$el;
                $outerContainer.css("min-height", "");

                //ipad cut off bottom fix
                //move element into body
                if (!this.$originalSeat && $.fn.inlinevideo.isiOS && alwaysFullWindow) {
                    this.$originalSeat = this.$el.parent();
                    $("body").append(this.$el);
                }

                var isWiderRatio = false;
                if (windowRatio > trackRatio) {
                    isWiderRatio = true;
                    this.$el.addClass("is-wider-ratio").removeClass("not-wider-ratio");
                } else {
                    this.$el.addClass("not-wider-ratio").removeClass("is-wider-ratio");
                }

                 height = $sizingImg.height();
                width = $sizingImg.width();

                if (isWiderRatio) {
                    width = windowHeight * trackRatio;
                    height = windowHeight;
                } else {
                    height = windowWidth / trackRatio;
                    width = windowWidth;
                }

                var top = 0;
                var left = 0;
                var outerHeight = $outerContainer.height();
                if (outerHeight > height) {
                    top = Math.floor((outerHeight - height) /2);
                }

                var outerWidth = $outerContainer.width();
                if (outerWidth > width) {
                    left = Math.floor((outerWidth - width) /2);
                }

                this.state.set({
                    trackRatio: trackRatio,
                    isWiderRatio: isWiderRatio,
                    height: height,
                    width: width,
                    top: top,
                    left: left
                });

                trackContainerWidth = width + "px";

                this.$el.css("min-height", height+"px");

            } else {
                //ipad cut off bottom fix
                //move element out of body
                if (this.$originalSeat) {
                    this.$originalSeat.append(this.$el);
                    this.$originalSeat = null;
                }
                
                this.$el.addClass("not-wider-ratio").removeClass("is-wider-ratio");
                this.$el.css("min-height", "");

                this.state.set({
                    trackRatio: trackRatio,
                    isWiderRatio: false,
                    height: "",
                    width: "",
                    top: "",
                    left: ""
                });


                trackContainerWidth = "";
            }

            var trackHeight = "100%",
                trackWidth = "100%",
                trackTop = "0",
                trackLeft = "0";

            if (isFullWindow && isFillWindow) {

                if (windowRatio < trackRatio) {
                    //track expand width and left offset
                    trackWidth = (windowHeight * trackRatio);
                    trackLeft = -((trackWidth - windowWidth) / 2) + "px";
                    trackWidth += "px";
                } else if (windowRatio > trackRatio) {
                    //track expand height and top offset
                    trackHeight = (windowWidth / trackRatio);
                    trackTop = -((trackHeight - windowHeight) / 2) + "px";
                    trackHeight += "px";
                } else {
                    //set height and width to 100%;

                }
 
            } 

            this.state.set({
                trackHeight: trackHeight,
                trackWidth: trackWidth,
                trackTop: trackTop,
                trackLeft: trackLeft
            });

            if (isFillWindow) {
                this.state.set({
                    trackContainerWidth: "100%"
                })
            } else {
                this.state.set({
                    trackContainerWidth: trackContainerWidth
                });
            }

        }

    });

    Controller.loaded(Resize);

    return Resize;

});
