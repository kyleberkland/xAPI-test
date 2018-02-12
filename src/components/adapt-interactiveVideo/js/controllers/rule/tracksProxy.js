define([
    './trackProxy'
], function(TrackProxy) {

    var TracksProxy = function(options) {
        var func = function(selector) {
            selector += "";
            var item = _.findWhere(func.parent.tracks, {_id: selector});
            if (!item) throw "Cannot find track " + selector;
            var itemProxy = new TrackProxy({parent: func.parent});
            itemProxy._track = item;
            return itemProxy;
        };
        func.parent = options.parent;
        func._track = null;
        return _.extend(func, this);
    };

    TracksProxy.prototype.preload = function(ids) {
        if (!(ids instanceof Array)) ids = [ids];
        for (var i = 0, l = ids.length; i < l; i++) {
            this(ids[i]).preload();
        }

        return this;
    };
    
    TracksProxy.prototype.goto = function(id, seconds, after) {
        if (after) {
            var track = this._track;
            var sprite = this._sprite;
            _.delay(_.bind(function() {
                var track1 = this._track;
                var sprite1 = this._sprite;
                this._track = track;
                this._sprite = sprite;
                this.goto(id, seconds);
                this._track = track1;
                this._sprite = sprite1;
            }, this), after*1000);
            return this;
        }

        for (var i = 0, l = this.parent.controllers.length; i < l; i++) {
            var controller = this.parent.controllers[i];
            controller.trackGoto(id, seconds, this._track, this._sprite);
        }

        return this;
    };

    return TracksProxy;

});