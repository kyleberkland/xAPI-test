define([
    "../controller",
    "./rule/videoProxy",
    "./rule/tracksProxy",
    "./rule/trackProxy",
    "./rule/spritesProxy",
    "./rule/spriteProxy",
    "./rule/itemsProxy",
    "./rule/itemProxy",
    "./rule/saveProxy"
], function(Controller, VideoProxy, TracksProxy, TrackProxy, SpritesProxy, SpriteProxy, ItemsProxy, ItemProxy, SaveProxy) {

    var Rule = Controller.extend({

        contexts: [],

        postInitialize: function(options) {
            this.videoProxy = new VideoProxy({parent:this});
            this.tracksProxy = new TracksProxy({parent:this});
            this.trackProxy = new TrackProxy({parent:this});
            this.spriteProxy = new SpriteProxy({parent:this});
            this.itemProxy = new ItemProxy({parent:this});
            this.itemsProxy = new ItemsProxy({parent:this});
            this.spritesProxy = new SpritesProxy({parent:this});
            this.saveProxy = new SaveProxy({parent:this});
            this.state = options.state;
        },

        render: function() {
            var renderCount = this.parent.state.get("renderCount") || 0;
            renderCount++;
            this.parent.state.set("renderCount", renderCount);

            if (!this.spriteProxy._sprite) return;

            var liveSprites = this.state.get("liveSprites");
            if (!liveSprites[this.spriteProxy._sprite._id]) return;

            liveSprites[this.spriteProxy._sprite._id].render();
        },

        addContext: function(track, sprite, item) {

            this.contexts.push({
                track:track,
                sprite:sprite,
                item:item
            });
            //console.log("add rule context", this.contexts.length, track, sprite, item);

            this.videoProxy._sprite = sprite;
            this.tracksProxy._track = track;
            this.tracksProxy._sprite = sprite;
            this.trackProxy._track = track;
            this.spriteProxy._track = track;
            this.spriteProxy._sprite = sprite;
            this.itemsProxy._sprite = sprite;
            this.spritesProxy._track = track;

            if (item) {
                this.itemProxy._item = item;
            }

        },

        removeContext: function() {

            if (this.contexts.length === 0) {

                return;

            } else {

                this.contexts.pop();
                
                if (this.contexts.length === 0) {
                    this.videoProxy._sprite = undefined;
                    this.tracksProxy._track = undefined;
                    this.tracksProxy._sprite = undefined;
                    this.trackProxy._track = undefined;
                    this.spriteProxy._track = undefined;
                    this.spriteProxy._sprite = undefined;
                    this.itemsProxy._sprite = undefined;
                    this.spritesProxy._track = undefined;
                    this.itemProxy._item = undefined;
                    return;
                }

                var context = this.contexts[this.contexts.length-1];

                var track = context.track;
                var sprite = context.sprite;
                var item = context.item;
                
                //console.log("fallback to rule context", this.contexts.length, track, sprite, item);

                this.videoProxy._sprite = sprite;
                this.tracksProxy._track = track;
                this.tracksProxy._sprite = sprite;
                this.trackProxy._track = track;
                this.spriteProxy._track = track;
                this.spriteProxy._sprite = sprite;
                this.itemsProxy._sprite = sprite;
                this.spritesProxy._track = track;

                if (item) {
                    this.itemProxy._item = item;
                }

            }

        },

        ruleExecute: function(track, sprite, item, ruleObject) {
            if (this.isRemoved) return;

            var score = this.model.get("score");
            var flag = this.model.get("flag");

            this.addContext(track, sprite, item);

            ruleObject.result = this.runRule(
                this.videoProxy,
                this.tracksProxy,
                this.trackProxy, 
                this.spritesProxy, 
                this.itemsProxy, 
                this.spriteProxy, 
                item ? this.itemProxy : null, 
                score,
                flag,
                ruleObject.rule,
                this.saveProxy
            );

            this.removeContext();

        },

        //make context in which to run rules
        runRule: function(
            video,
            tracks,
            track, 
            sprites, 
            items, 
            sprite, 
            item, 
            score, 
            flag, 
            rule, 
            save
        ) {
            var result = false;

            try {
                return (result = (eval(rule)) || result);
            } catch(e) {
               debugger;
               console.log("rule error on sprite:"+ sprite._sprite._id + "\n\n"+rule+"\n\n"+
                   e);
               return result;
            }
        }

    });

    Controller.loaded(Rule);

    return Rule;

});
