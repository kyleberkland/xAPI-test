define(function() {

    var SaveProxy = function(options) {
        this.parent = options.parent;
    };
    
    SaveProxy.prototype.position = function(trackId, seconds) {
        for (var i = 0, l = this.parent.controllers.length; i < l; i++) {
            var controller = this.parent.controllers[i];
            controller.savePosition(trackId, seconds);
        }
        return this;
    };

    SaveProxy.prototype.score = function() {
        for (var i = 0, l = this.parent.controllers.length; i < l; i++) {
            var controller = this.parent.controllers[i];
            controller.saveScore();
        }
        return this;
    };

    SaveProxy.prototype.reset = function() {
        for (var i = 0, l = this.parent.controllers.length; i < l; i++) {
            var controller = this.parent.controllers[i];
            controller.saveReset();
        }
        return this;
    };

    return SaveProxy;
    
});