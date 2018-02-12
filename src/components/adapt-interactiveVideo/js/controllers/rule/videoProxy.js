define(function() {

    var VideoProxy = function(options) {
        this.parent = options.parent;
        this._sprite = null;
    };

    VideoProxy.prototype.resetCompletion = function() {

        for (var i = 0, l = this.parent.sprites.length; i < l; i++) {
            var sprite = this.parent.sprites[i];
            sprite.__isComplete = false;
        }

        for (var i = 0, l = this.parent.items.length; i < l; i++) {
            var item = this.parent.items[i];
            item.__isComplete = false;
        }


    };

    VideoProxy.prototype.addClass = function(className, after) {
        
        if (after) {
            _.delay(_.bind(function() {
                this.addClass(className);
            }, this), after*1000);
            return this;
        }

        this.parent.$el.addClass(className);

        return this;

    };

    VideoProxy.prototype.hasClass = function(className) {

        return this.parent.$el.hasClass(className);

    };

    VideoProxy.prototype.removeClass = function(className, after) {
        
        if (after) {
            _.delay(_.bind(function() {
                this.removeClass(className);
            }, this), after*1000);
            return this;
        }

        this.parent.$el.removeClass(className);

        return this;

    };
    
    VideoProxy.prototype.fullscreen = function() {
        var controllers = this.parent.controllers;
        for (var i = 0, l = controllers.length; i < l; i++) {
            var controller = controllers[i];
            if (controller.enterFullScreen) {
                controller.enterFullScreen();
            }
        }
    };

    VideoProxy.prototype.exitFullscreen = function() {
        var controllers = this.parent.controllers;
        for (var i = 0, l = controllers.length; i < l; i++) {
            var controller = controllers[i];
            if (controller.exitFullScreen) {
                controller.exitFullScreen();
            }
        }
    };

    VideoProxy.prototype.isFullscreen = function() {
        return this.parent.state.get("isFullScreen");
    };

    VideoProxy.prototype.pause = function() {
        var isPlaying = this.parent.state.get("isPlaying");

        if (!isPlaying) return;

        var controllers = this.parent.controllers;
        for (var i = 0, l = controllers.length; i < l; i++) {
            var controller = controllers[i];
            if (controller.onGlobalPlayPause) {
                controller.onGlobalPlayPause();
            }
        }

    }

    return VideoProxy;
    
});