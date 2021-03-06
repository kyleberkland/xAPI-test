define([
    'core/js/adapt',
    'core/js/views/componentView',
    './animations/roundrobin.js'
], function(Adapt, ComponentView, RoundRobin) {

    var Animations = {
        "roundrobin": RoundRobin
    };

    var Carousel = ComponentView.extend({

        preRender: function() {
            this.checkIfResetOnRevisit();
        },

        postRender: function() {

            var animation = this.model.get("_animation");
            var animationType = animation._type || "roundrobin";

            var AnimationView = Animations[ animationType ];
            this.animationView = new AnimationView({ 
                el: this.el, 
                model: this.model 
            });

            this.setReadyStatus();

            this.setupInview();
        },

        setupInview: function() {
            var selector = this.getInviewElementSelector();

            if (!selector) {
                this.setCompletionStatus();
            } else {
                this.model.set('inviewElementSelector', selector);
                this.$(selector).on('inview', _.bind(this.inview, this));
            }
        },

        /**
         * determines which element should be used for inview logic - body, instruction or title - and returns the selector for that element
         */
        getInviewElementSelector: function() {
            if(this.model.get('body')) return '.component-body';

            if(this.model.get('instruction')) return '.component-instruction';
            
            if(this.model.get('displayTitle')) return '.component-title';

            return null;
        },

        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.$(this.model.get('inviewElementSelector')).off('inview');
                    this.setCompletionStatus();
                }
            }
        },

        remove: function() {
            if(this.model.has('inviewElementSelector')) {
                this.$(this.model.get('inviewElementSelector')).off('inview');
            }
            
            ComponentView.prototype.remove.call(this);

            this.animationView.remove();
        }
        
    },
    {
        template: 'carousel'
    });

    Adapt.register('carousel', Carousel);

    return Carousel;
});
