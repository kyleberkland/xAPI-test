define([
    "./utils/inlineVideo",
    "./utils/diffView",
    "./utils/helpers",
    './sprites/index',
    './controllers/index',
    './tracks/index'
], function(InlineVideo, DiffView, Helpers) {

    var uid = 0;

    var InteractiveVideoContainer = DiffView.extend({

    	trackViews: null,
        tracks: null,
        sprites: null,
        controllers: null,
        statics: null,

    	className: function() {
    		return "interactivevideo-container video no-select iv-background-color not-ready";
    	},

    	postInitialize: function(options) {
            if (options.uid === undefined) {
                this.uid = uid++;
            } else {
                this.uid = options.uid;
            }

            this.state.set("uid", this.uid)

            this.controllers = [];
            this.statics = [];
    		this.trackViews = [];
            this.tracks = this.model.get("_config")._tracks;
            this.tracks.byId = {};
            this.sprites = [];
            this.sprites.byId = {};
            this.items = [];
            this.items.byId = {};
            
            this.$el.addClass(this.model.get("_config")._className);

            this.indexTracksAndSprites();

            InteractiveVideo.trigger("register");
            
            _.defer(_.bind(this.createControllers, this));

    	},

        globalMediaStop: function() {
            this.trigger("media:stop");
        },

        indexTracksAndSprites: function() {
            var __ = this;
            _.each(this.tracks, function(track, index) {
                if (track._index === undefined) {
                    track._index = index;
                }
                if (!track._sprites || track._sprites.length === 0) return;
                //index by supplied order
                _.each(track._sprites, function(sprite, index) {
                    sprite.trackId = track._id;
                    sprite._id = track._id+":"+sprite._id;
                    if (sprite._index === undefined) {
                        sprite._index = index;
                    }
                });
                //order by start time then supplied order
                track._sprites.sort(function(a,b) {
                    return (a._startSeconds - b._startSeconds) || (a._index - b._index);
                });

                __.tracks.byId[track._id] = track;
                //reindex by changed order
                _.each(track._sprites, function(sprite, index) {
                    sprite._index = index;
                    __.sprites.push(sprite);
                    __.sprites.byId[sprite._id] = sprite;
                    if (sprite._items) {
                        sprite._items.sort(function(a,b) {
                            return (a._index - b._index);
                        });
                        _.each(sprite._items, function(item, index) {
                            item.trackId = track._id;
                            item.spriteId = sprite._id;
                            item._id = sprite._id+":"+(index+1);
                            __.items.push(item);
                            __.items.byId[item._id] = item;
                        });
                    }
                });
            });
            this.tracks.sort(function(a,b) {
                return (a._index - b._index);
            });
        },

        createControllers: function() {

            this.controllers.ready = 0;

            for (var i = 0, l = InteractiveVideo.controllerStore.length; i < l; i++) {
                var controller = new  InteractiveVideo.controllerStore[i]({
                    model: this.model,
                    state: this.state,
                    parent: this,
                    interactivevideo: this,
                    el: this.$el
                });
                this.listenToOnce(controller, "ready", this.onControllerReady, this);
                this.controllers.push(controller);
            }

        },

    	postRender: function(isFirstRender) {
    		if (!isFirstRender) return;

            _.defer(_.bind(this.setupControllers, this));
    	},

        setupControllers: function() {
            if (!this.hasRendered) return;

            for (var i = 0, l = this.controllers.length; i < l; i++) {
                var controller = this.controllers[i];
                controller.preSetup();
            }
            for (var i = 0, l = this.controllers.length; i < l; i++) {
                var controller = this.controllers[i];
                controller.setup();
            }
            for (var i = 0, l = this.controllers.length; i < l; i++) {
                var controller = this.controllers[i];
                controller.postSetup();
            }

            this.checkReady();

            this.render();
        },

        onControllerReady: function() {
            this.controllers.ready++;
            this.checkReady();
        },

        checkReady: function() {
            if (!this.hasRendered) return;

            if (this.controllers.ready != this.controllers.length) return;
            
            for (var i = 0, l = this.controllers.length; i < l; i++) {
                var controller = this.controllers[i];
                controller.ready();
            }

            _.defer(_.bind(function() {
                this.model.set("_isReady", true);                
                this.trigger("ready");
            }, this));

            _.delay(_.bind(function() {
                this.model.set("_allowGlobalEvents", true);
            }, this), 1000);
        },

        stateChanged: function() {
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

        resize: function() {
            for (var i = 0, l = this.controllers.length; i < l; i++) {
                var controller = this.controllers[i];
                controller.resize();
            }
        },

        preloaded: function() {
            for (var i = 0, l = this.controllers.length; i < l; i++) {
                var controller = this.controllers[i];
                controller.preloaded();
            }
        },

        complete: function(scoreObject, score, scoreToPass) {
            this.trigger("complete", scoreObject, score, scoreToPass);
        },

        remove: function() {
            for (var i = 0, l = this.controllers.length; i < l; i++) {
                this.controllers[i].remove();
            }
            for (var i = 0, l = this.statics.length; i < l; i++) {
                this.statics[i].remove();
            }
            DiffView.prototype.remove.apply(this, arguments);
        }
        
    }, {
    	template: "interactiveVideoContainer"
    });

    return InteractiveVideoContainer;

});
