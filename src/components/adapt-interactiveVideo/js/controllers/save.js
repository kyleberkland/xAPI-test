define([
    "../controller"
], function(Controller) {

    var Save = Controller.extend({

        storage: null,
        isRestored: false,

        postInitialize: function(options) {            
            this.setUpStorage();
            this.restore();
        },

        setUpStorage: function() {
            this.storage = {
                s: null,
                p: {
                    t: null,
                    z: null
                }
            };
        },

        scoreInitialize: function() {
            this.restore();

            var score = this.model.get("score");

            for (var k in this.storage.s) {
                if (this.storage.s.hasOwnProperty(k)) {
                    score[k] = this.storage.s[k];
                }
            }
        },

        scoreChange: function(scoreObject) {
            var score = this.model.get("score");
            this.storage.s = score.toJSON();
        },

        trackChanged: function(toTrack, fromTrack, seconds) {
            this.storage.p.t = toTrack._id;
            this.storage.p.z = seconds;
        },

        trackSeconds: function(trackView, seconds) {
            this.storage.p.t = trackView.model.get("_id");
            this.storage.p.z = seconds;
        },

        saveReset: function() {
            this.setUpStorage();
            var score = this.model.get("score");
            score.reset();
        },

        saveScore: function() {
            InteractiveVideo.save(this.parent.uid, "s", this.storage.s);
        },

        savePosition: function(trackId, position) {
            
            if (trackId !== null && trackId !== undefined) {
                this.storage.p.t = trackId;
            }

            if (position !== null && position !== undefined) {
                this.storage.p.z = position;
            } else {
                this.storage.p.z = 0;
            }

            InteractiveVideo.save(this.parent.uid, "p", this.storage.p);
        },

        restore: function(scoreObject) {
            if (this.isRestored) return;
            this.isRestored = true;

            //pull from adapt offline storage and restore
            var restored = InteractiveVideo.restore(this.parent.uid);
            if (!restored) return;

            this.storage.s = restored.s;
            this.storage.p = restored.p || { t: null, z: null};

            this.model.set("_start", this.storage.p);
        }

    });

    Controller.loaded(Save);

    return Save;

});
