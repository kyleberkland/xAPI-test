define([
    './itemsProxy'
], function(ItemsProxy) {

    var SpriteProxy = function(options) {
        this.parent = options.parent;
        this._sprite = null;
        this._track = null;

        Object.defineProperty(this, "name", {

            get: function() {
                this._sprite.name;
            }

        });

        Object.defineProperty(this, "isComplete", {

            get: function() {
                return this._sprite.__isComplete;
            }

        });


    };

    SpriteProxy.prototype.complete = function() {
        this._sprite.__isComplete = true;
    };

    SpriteProxy.prototype.reset = function() {
        this._sprite.resetOnEnd = true;
        this._sprite._isEnded = false;
        if (this._sprite._restoreEndSeconds !== undefined) {
            this._sprite._endSeconds = this._sprite._restoreEndSeconds;
            this._sprite._endSeconds = this._sprite._restoreEndSeconds;
            delete this._sprite._restoreEndSeconds;
        }
    };

    SpriteProxy.prototype.addClass = function(className) {
        var liveSprites = this.parent.state.get("liveSprites");
        var prestartedSprites = this.parent.state.get("prestartedSprites");
        if (liveSprites[this._sprite._id]) {
        	liveSprites[this._sprite._id].$el.addClass(className);
        }
        if (prestartedSprites[this._sprite._id]) {
        	prestartedSprites[this._sprite._id].$el.addClass(className);
        }
    };

    SpriteProxy.prototype.isModal = function() {
    	return this._sprite._isModal;
    };

    SpriteProxy.prototype.removeClass = function(className) {
        var liveSprites = this.parent.state.get("liveSprites");
        var prestartedSprites = this.parent.state.get("prestartedSprites");
        if (liveSprites[this._sprite._id]) {
        	liveSprites[this._sprite._id].$el.removeClass(className);
        }
        if (prestartedSprites[this._sprite._id]) {
        	prestartedSprites[this._sprite._id].$el.removeClass(className);
        }
    };

    SpriteProxy.prototype.items = function(id) {
        var items = new ItemsProxy({parent:this.parent});
        items._sprite = this._sprite;
        if (arguments.length === 0) return items;
        return items(id);
    };

    SpriteProxy.prototype.endAfter = function(seconds) {
        
        this._sprite._restoreEndSeconds = this._sprite._endSeconds;
        this._sprite._endSeconds = this._track.__seconds + seconds;


    };

    return SpriteProxy;

});