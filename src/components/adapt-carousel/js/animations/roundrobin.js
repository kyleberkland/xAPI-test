define([
    'core/js/adapt'
], function(Adapt) {

    var RoundRobin = Backbone.View.extend({

        initialize: function(options) {

            this.listenTo(Adapt, "device:resize", this.onResize);
            this.onResize();

            this.startAnimation();

            this.$el.addClass("roundrobin");

        },

        onResize: function() {
            
            var animation = this.model.get("_animation");
            var $items = this.$(".carousel-grid-item");

            var animateDuration = (animation._duration || 1500) / 1000;

            $items.css({
                "-webkit-transition": "",
                "transition": ""
            });

            var items = this.model.get("_items");

            var count = items.length;

            var $inner = this.$(".carousel-grid-inner");
            var width = $inner.width();

            var min = width / animation._minWidth;
            var max = width / animation._maxWidth;

            var number = Math.round((min+max) / 2);

            this.width = (100/number);

            $items.css({
                width: this.width + "%",
                "-webkit-transition": "width "+animateDuration+"s ease-out",
                "transition": "width "+animateDuration+"s ease-out"
            });

        },

        startAnimation: function() {

            var animation = this.model.get("_animation");
            var animateInterval = animation._interval || 5000;

            _.bindAll(this, "onAnimate");
            this.handle = setInterval(this.onAnimate, animateInterval);

        },

        onAnimate: function() {

            var animation = this.model.get("_animation");
            var animateDuration = animation._animateDuration || 1500;

            var $items = this.$(".carousel-grid-item");
            var $inner = this.$(".carousel-grid-inner");

            var $firstItem = $($items[0]);
            //fix the width of the first item img
            //align it absolute right
            $firstItem.find("img").css({
                position: "absolute",
                right: 0,
                top: 0,
                width: $firstItem.width() + "px"
            });

            //animate to 0 the first item container
            //gives the appearance of the first item scrolling offscreen
            $firstItem.css({
                width:0
            });

            _.delay(_.bind(function() {
                $inner.append($firstItem);
                $firstItem.find("img").css({
                    position: "",
                    right: "",
                    top: "",
                    width: ""
                });
                $firstItem.css({
                    width: this.width + "%"
                });
            }, this), animateDuration);

        },

        remove: function() {

            this.stopAnimation();

        },

        stopAnimation: function() {
            clearInterval(this.handle);
        }

    });

    return RoundRobin;

});