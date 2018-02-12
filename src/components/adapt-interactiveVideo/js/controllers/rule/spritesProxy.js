define([
    './spriteProxy'
], function(SpriteProxy) {
    
    var SpritesProxy = function(options) {
        var func = function(selector) {
            var item = _.findWhere(func.parent.sprites, {_id: selector});
            if (!item) {
                item = _.findWhere(func.parent.sprites, {_id: func._track._id + ":" + selector});
                if (!item) throw "Cannot find sprite " + selector;
            }
            var itemProxy = new SpriteProxy({parent: func.parent});
            itemProxy._sprite = item;
            return itemProxy;
        };
        func.parent = options.parent;
        func._track = null;
        return _.extend(func, this);
    };

    SpritesProxy.prototype.show = function(ids, dontModal) {
        var liveSprites = this.parent.state.get("liveSprites");
        var prestartedSprites = this.parent.state.get("prestartedSprites");

        for (var a = 0, al = arguments.length; a < al; a++) {
            var id = arguments[a];
            id = ""+id;

            var found = false;
            var liveSprite = liveSprites[id];
            if (liveSprite) {
                found = true;
            }
            if (found) continue;
            
            var spriteView;
            var sprite = _.findWhere(this.parent.sprites, {_id:id});
            
            if (!sprite) continue;

            var track = this._track;
            sprite._isEnded = false;

            var preConditionMet = true;
            for (var i = 0, l = this.parent.controllers.length; i < l; i++) {
                if (this.parent.controllers[i].hasSpriteRuleStart) {
                    preConditionMet = this.parent.controllers[i].hasSpriteRuleStart(track, sprite);
                    break;
                }
            }

            if (!preConditionMet) continue;

            var prestartedSprite = prestartedSprites[id];
            if (!prestartedSprite) {

                for (var i = 0, l = this.parent.controllers.length; i < l; i++) {
                    if (this.parent.controllers[i].prestartSprite) {
                        spriteView = this.parent.controllers[i].prestartSprite(track, sprite);
                        break;
                    }
                }
            
            } else {
                spriteView = prestartedSprite;
                sprite = spriteView.model;
            }

            if (!spriteView) continue;

            if (sprite.useStaticContainer) {
                if (spriteView.$el.parents(".sprites-container-statics").length == 0) {
                    this.parent.$(".sprites-container-statics").append(spriteView.$el);
                }
            } else {
                if (spriteView.$el.parents(".sprites-container-inner").length == 0) {
                    this.parent.$(".sprites-container-inner").append(spriteView.$el);
                }
            }

            for (var i = 0, l = this.parent.controllers.length; i < l; i++) {
                if (this.parent.controllers[i].performPauseBeforeSprite) {
                    this.parent.controllers[i].performPauseBeforeSprite(track, sprite);
                    break;
                }
            }
            
            spriteView.preStart();
            if (!dontModal) {
            	spriteView.isModal = true;
            	spriteView.model._isModal = true;
            }
            liveSprites[id] = spriteView;
            delete prestartedSprites[id];
            spriteView.once("removed", _.bind(function() {
                this.hide(id);
            }, this));
        }
    };
    
    SpritesProxy.prototype.hide = function(ids) {
        var liveSprites = this.parent.state.get("liveSprites");
        var prestartedSprites = this.parent.state.get("prestartedSprites");

        for (var a = 0, al = arguments.length; a < al; a++) {
            var id = arguments[a];
            id = ""+id;
            var liveSprite = liveSprites[id];
            if (liveSprite) {
                if (!liveSprite.isModal) {
                    liveSprite.setEnded();
                    liveSprite.triggerContinue();
                    liveSprite.remove();
                    delete liveSprites[id];
                }
                
            }
            var prestartedSprite = prestartedSprites[id];
            if (prestartedSprite) {
                if (!liveSprite.isModal) {
                    prestartedSprite.setEnded();
                    prestartedSprite.remove();
                    delete prestartedSprite[id];
                }
            }
        }
    };

    SpritesProxy.prototype.preload = function(ids) {
        var liveSprites = this.parent.state.get("liveSprites");
        var prestartedSprites = this.parent.state.get("prestartedSprites");

        var dontModal = (!this.parent.state.get("isContinueLocked"));

        this.show(ids, dontModal);
        for (var a = 0, al = arguments.length; a < al; a++) {
            var id = arguments[a];
            id = ""+id;
            var liveSprite = liveSprites[id];
            if (liveSprite) {
                if (liveSprite.manualPreload) {
                    liveSprite.manualPreload();
                } else {
                    console.log("CANNOT PRELOAD");
                }
            }
            var prestartedSprite = prestartedSprites[id];
            if (prestartedSprite) {
                if (prestartedSprite.manualPreload) {
                    prestartedSprite.manualPreload();
                } else {
                    console.log("CANNOT PRELOAD");
                }
            }
        }
    };

    SpritesProxy.prototype.replay = function(ids) {
        var liveSprites = this.parent.state.get("liveSprites");
        var prestartedSprites = this.parent.state.get("prestartedSprites");

        var dontModal = (!this.parent.state.get("isContinueLocked"));

        this.show(ids, dontModal);
        for (var a = 0, al = arguments.length; a < al; a++) {
            var id = arguments[a];
            id = ""+id;
            var liveSprite = liveSprites[id];
            if (liveSprite) {
                if (liveSprite.play) {

                    if (liveSprite.mediaView) {
                        for (var i = 0, l = this.parent.controllers.length; i < l; i++) {
                            var controller = this.parent.controllers[i];
                            controller.mediaVolumeUp(liveSprite.mediaView);
                        }
                    }

                    liveSprite.play(0);
                } else {
                    console.log("CANNOT PLAY");
                }
            }
            var prestartedSprite = prestartedSprites[id];
            if (prestartedSprite) {
                if (prestartedSprite.play) {
                    prestartedSprite.play(0);
                } else {
                    console.log("CANNOT PLAY");
                }
            }
        }
    };

    SpritesProxy.prototype.play = function(ids) {
        var liveSprites = this.parent.state.get("liveSprites");
        var prestartedSprites = this.parent.state.get("prestartedSprites");

        var dontModal = (!this.parent.state.get("isContinueLocked"));

        this.show(ids, dontModal);
        for (var a = 0, al = arguments.length; a < al; a++) {
            var id = arguments[a];
            id = ""+id;
            var liveSprite = liveSprites[id];
            if (liveSprite) {
                if (liveSprite.play) {

                    if (liveSprite.mediaView) {
                        for (var i = 0, l = this.parent.controllers.length; i < l; i++) {
                            var controller = this.parent.controllers[i];
                            controller.mediaVolumeUp(liveSprite.mediaView);
                        }
                    }

                    liveSprite.play();
                } else {
                    console.log("CANNOT PLAY");
                }
            }
            var prestartedSprite = prestartedSprites[id];
            if (prestartedSprite) {
                if (prestartedSprite.play) {
                    prestartedSprite.play();
                } else {
                    console.log("CANNOT PLAY");
                }
            }
        }
    };

    SpritesProxy.prototype.addClass = function(id, className) {
        var liveSprites = this.parent.state.get("liveSprites");
        var prestartedSprites = this.parent.state.get("prestartedSprites");

        for (var a = 0, al = arguments.length; a < al; a++) {
            var id = arguments[a];
            id = ""+id;
            var liveSprite = liveSprites[id];
            if (liveSprite) {
                liveSprite.$el.addClass(className);
            }
            var prestartedSprite = prestartedSprites[id];
            if (prestartedSprite) {
                prestartedSprite.$el.addClass(className);
            }
        }
    };

    SpritesProxy.prototype.removeClass = function(id, className) {
        var liveSprites = this.parent.state.get("liveSprites");
        var prestartedSprites = this.parent.state.get("prestartedSprites");

        for (var a = 0, al = arguments.length; a < al; a++) {
            var id = arguments[a];
            id = ""+id;
            var liveSprite = liveSprites[id];
            if (liveSprite) {
                liveSprite.$el.removeClass(className);
            }
            var prestartedSprite = prestartedSprites[id];
            if (prestartedSprite) {
                prestartedSprite.$el.removeClass(className);
            }
        }
    };

    SpritesProxy.prototype.pause = function(ids) {
        var liveSprites = this.parent.state.get("liveSprites");
        var prestartedSprites = this.parent.state.get("prestartedSprites");

        this.show(ids);
        for (var a = 0, al = arguments.length; a < al; a++) {
            var id = arguments[a];
            id = ""+id;
            var liveSprite = liveSprites[id];
            if (liveSprite) {
                if (liveSprite.pause) {
                    liveSprite.pause();
                } else {
                    console.log("CANNOT PAUSE");
                }
            }

            var prestartedSprite = prestartedSprites[id];
            if (prestartedSprite) {
                if (prestartedSprite.pause) {
                    prestartedSprite.pause();
                } else {
                    console.log("CANNOT PAUSE");
                }
            }
        }
    };

    return SpritesProxy;

});