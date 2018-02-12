define([
    './spritesProxy'
], function(SpritesProxy) {

    var TrackProxy = function(options) {
        this.parent = options.parent;
        this._track = null;
    };
    
    TrackProxy.prototype.addClass = function(className, after) {
        if (after) {
            var track = this._track;
            _.delay(_.bind(function() {
                var track1 = this._track;
                this._track = track;
                this.addClass(className);
                this._track = track1;
            }, this), after*1000);
            return this;
        }

        this._track._className = this._track._className || "";
        var names = this._track._className.split(" ");
        names = _.uniq(names);

        var isFound = false;
        names = _.filter(names, function(name) {
            if (name.toLowerCase() === className.toLowerCase()) isFound = true;
            return name;
        });
        
        if (isFound) return this;

        names.push(className);
        this._track._className = names.join(" ");

        this.parent.state.set("trackClassName", this._track._className);
        this.parent.render();

        return this;
    };

    TrackProxy.prototype.hasClass = function(className) {

        this._track._className = this._track._className || "";
        var names = this._track._className.split(" ");
        names = _.uniq(names);

        var isFound = false;
        names = _.filter(names, function(name) {
            if (name.toLowerCase() === className.toLowerCase()) isFound = true;
            return name;
        });
        
        if (isFound) return true;

        return false;
    };

    TrackProxy.prototype.removeClass = function(className, after) {
        if (after) {
            var track = this._track;
            _.delay(_.bind(function() {
                var track1 = this._track;
                this._track = track;
                this.removeClass(className);
                this._track = track1;
            }, this), after*1000);
            return this;
        }
        this._track._className = this._track._className || "";
        var names = this._track._className.split(" ");
        names = _.uniq(names);

        var isFound = false;
        names = _.filter(names, function(name) {
            if (name.toLowerCase() === className.toLowerCase()) {
                isFound = true;
                return false;
            }
            return name;
        });

        if (!isFound) return this;

        this._track._className = names.join(" ");

        this.parent.state.set("trackClassName", this._track._className);
        this.parent.render();

        return this;
    };


    TrackProxy.prototype.play = function(seekTo, after) {

         if (after) {
            var track = this._track;
            _.delay(_.bind(function() {
                var track1 = this._track;
                this._track = track;
                this.play(seekTo);
                this._track = track1;
            }, this), after*1000);
        }

        for (var i = 0, l = this.parent.trackViews.length; i < l; i++) {
            if (this.parent.trackViews[i].model.get("_id") != this._track._id) continue;

            this.parent.trackViews[i].play(seekTo);
            return this;
        }

        return this;
    };

    TrackProxy.prototype.pause = function(after) {

        if (after) {
            var track = this._track;
            _.delay(_.bind(function() {
                var track1 = this._track;
                this._track = track;
                this.pause();
                this._track = track1;
            }, this), after*1000);
        }

        for (var i = 0, l = this.parent.trackViews.length; i < l; i++) {
            if (this.parent.trackViews[i].model.get("_id") != this._track._id) continue;

            this.parent.trackViews[i].pause();
            return this;
        }

        return this;
    };

    TrackProxy.prototype.preload = function() {
        for (var i = 0, l = this.parent.trackViews.length; i < l; i++) {
            if (this.parent.trackViews[i].model.get("_id") != this._track._id) continue;

            this.parent.trackViews[i].preload();
            return this;
        }

        return this;
    };

    TrackProxy.prototype.sprites = function(id) {
        var items = new SpritesProxy({parent:this.parent});
        items._track = this._track;
        if (arguments.length === 0) return items;
        return items(id);
    };

    return TrackProxy;

});