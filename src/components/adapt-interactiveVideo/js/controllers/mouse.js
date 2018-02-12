define([
    "../controller"
], function(Controller) {

    var MouseView = Controller.extend({

        events: {
            "mousemove": "onMouseAction",
            "mousedown": "onMouseAction"
        },

        _timeoutHandle: null,

        onMouseAction: function() {
            this.state.set("mouse", true);
            clearTimeout(this._timeoutHandle);
            this._timeoutHandle = setTimeout(_.bind(function() {
                if (this.isRemoved) return;
                this.state.set("mouse", false);
            }, this), 2000);
        }

    });

    Controller.loaded(MouseView);

    return MouseView;

});
