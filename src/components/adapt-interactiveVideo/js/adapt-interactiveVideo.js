define([
    "core/js/adapt",
    'coreViews/questionView',
    './interactiveVideoContainer'
], function(Adapt, QuestionView, InteractiveVideoContainer) {

    var AdaptInteractiveVideo = QuestionView.extend({

        interactiveVideoContainer: null,

        resetQuestionOnRevisit: function() {
            InteractiveVideo.reset(this.model.get("_id"));
        },

        setupQuestion: function() {
            this.model.set("_canShowFeedback", false);
            this.restoreUserAnswers();
            this.loadInteractiveVideoConfiguration();
        },

        loadInteractiveVideoConfiguration: function() {
            $.get(this.model.get("_interactiveVideoPath")+"/video.json", _.bind(this.interactiveVideoConfigurationLoaded, this));
        },

        interactiveVideoConfigurationLoaded: function(data) {

            if (typeof data !== "object") data = JSON.parse(data);

            this.interactiveVideoContainer = new InteractiveVideoContainer({
                model: new Backbone.Model({
                    _path: this.model.get("_interactiveVideoPath"),
                    _config: data,
                    isComplete: this.model.get("_isComplete")
                }),
                uid: this.model.get("_id")
            });

            this.setUpEventListeners();

            this.$(".interactiveview-widget").append(this.interactiveVideoContainer.$el);


        },

        setUpEventListeners: function() {

            this.listenToOnce(this.interactiveVideoContainer, "ready", this.onInteractiveVideoReady);
            this.listenTo(this.interactiveVideoContainer, "media:stop", this.onInteractiveVideoMediaStop);
            this.listenTo(this.interactiveVideoContainer, "complete", this.onInteractiveVideoCompleted);
            this.listenTo(this.model, "change:_isComplete", this.onComponentComplete);
        },

        onInteractiveVideoReady: function() {
            //slow down loading time if connection speed is fast
            var waitFor = 200;
            if (window.speedtest) {
                switch (speedtest.low_name) {
                case "slow":
                    waitFor = 200;
                    break;
                case "fast":
                    waitFor = 200;
                    break;
                }
            }

            _.delay(_.bind(function() {
                this.$el.imageready(_.bind(function() {
                    this.interactiveVideoContainer.resize();
                    
                    _.delay(_.bind(function() {
                        this.setReadyStatus();
                        this.interactiveVideoContainer.$el.addClass("is-ready").removeClass("not-ready");
                    }, this), 200);

                }, this));
            }, this), waitFor);

        },

        onInteractiveVideoMediaStop: function() {
            Adapt.trigger("media:stop");
        },

        onInteractiveVideoCompleted: function(scoreObject, score, scoreToPass) {

            if (scoreToPass !== undefined) {
                this.model.set("_interactiveVideoScoreToPass", scoreToPass);
            }

            score = score || 0;
            this.model.set("_score", score);

            if (!score) return;
            if (!scoreToPass) return;
            if (score < scoreToPass) return;

            this.onSubmitClicked();
        },

        onComponentComplete: function(model, value) {
            if (!value) return;

            //update score mechanism and handlebars
            this.interactiveVideoContainer.model.set("isComplete", true);
            this.interactiveVideoContainer.model.get("score").isComplete = true;
        },

        restoreUserAnswers: function() {
            if (!this.model.get("_isSubmitted")) return;

            var userAnswer = this.model.get("_userAnswer");
            var isComplete = userAnswer[0] === 1 ? true : false;
            var score = userAnswer[1] || 0;

            this.model.set("_score", score);
        },

        // disableQuestion: function() {},

        // enableQuestion: function() {},

        // onQuestionRendered: function() {},

        canSubmit: function() {
            return this.isCorrect();
        },

        // onCannotSubmit: function() {},

        storeUserAnswer: function() {
            this.model.set("_userAnswer", [ 
                this.model.get("_isComplete") ? 1 : 0, 
                this.model.get("_score") 
            ]);
        },

        isCorrect: function() {
            var score = this.model.get("_score") || 0;

            var scoreToPass = this.model.get("_interactiveVideoScoreToPass");
            var isCorrect = score >= scoreToPass;

            return isCorrect;
        },

        // // Sets the score based upon the questionWeight
        // // Can be overwritten if the question needs to set the score in a different way
        // setScore: function() {},

        // setupFeedback: function() {},

        // setupIndividualFeedback: function(selectedItem) {},

        // This is important and should give the user feedback on how they answered the question
        // Normally done through ticks and crosses by adding classes
        // showMarking: function() {},

        isPartlyCorrect: function() {
            return this.isCorrect();
        },

        resetUserAnswer: function() {
            //TODO: issues here
            //InteractiveVideo.reset(this.model.get("_id"));
        },

        // // Used by the question view to reset the look and feel of the component.
        resetQuestion: function() {
            //TODO: issues here
            //InteractiveVideo.reset(this.model.get("_id"));
        },

        // showCorrectAnswer: function() {},

        // hideCorrectAnswer: function() {},

        /**
        * used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
        * returns the user's answers as a string in the format "1,5,2"
        */
        getResponse:function() {

        },

        /**
        * used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
        */
        getResponseType:function() {

        }

    });

    Adapt.register('interactivevideo', AdaptInteractiveVideo);

    return AdaptInteractiveVideo;

});
