define(function() {

    var ScoreObject = function(options) {
        this._parent = options.parent;
        this.isComplete = this._parent.model.get("isComplete");
    };

    ScoreObject.prototype.initialize = ScoreObject.prototype.initialise = ScoreObject.prototype.init = function(name, value) {
        if (this[name] === undefined) this[name] = value;
        this._parent.change();
        return this;
    };

    ScoreObject.prototype.add = function(name, value) {
        if (this[name] === undefined) this[name] = 0;
        this[name]+=value;
        this._parent.change();
        return this;
    };

    ScoreObject.prototype.minus = function(name, value) {
        if (this[name] === undefined) this[name] = 0;
        this[name]-=value;
        this._parent.change();
        return this;
    };

    ScoreObject.prototype.set = function(name, value) {
        this[name]=value;
        this._parent.change();
        return this;
    };

    ScoreObject.prototype.get = function(name) {
        return this[name];
    };

    ScoreObject.prototype.multiply = function(name, value) {
        if (this[name] === undefined) this[name] = 0;
        this[name]*=value;
        this._parent.change();
        return this;
    };

    ScoreObject.prototype.toJSON = function() {
        var json = {};
        for (var k in this) {
            switch (k) {
            case "_parent": continue;
            }
            if (this.hasOwnProperty(k)) {
                json[k] = this[k];
            }
        }
        return json;
    };

    ScoreObject.prototype.reset = function() {
        for (var k in this) {
            switch (k) {
            case "_parent": continue;
            }
            delete this[k];
        }
        return this;
    };

    ScoreObject.prototype.complete = function(score, scoreToPass) {
        if (!score) return;
        if (!scoreToPass) return;
        if (score < scoreToPass) return;
        this._parent.complete(score, scoreToPass);
    };
    
    return ScoreObject;

});