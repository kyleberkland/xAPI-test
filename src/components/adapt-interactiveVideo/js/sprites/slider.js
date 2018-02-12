define([
	'../sprite',
	'./textAndGraphic',
	'./slider/rangeslider'
], function(Sprite, TextAndGraphic) {


	var Slider = TextAndGraphic.extend({

		rangesliders: null,

		onBackgroundClick: function(e) {
			if (this._mouseDown || !this._allowBackgroundClick) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}
		},

		postInitialize: function() {
			this.rangesliders = {};
			this._allowBackgroundClick = this.model._allowBackgroundClick;
			this.onInit = _.bind(this.onInit, this);
			this.onInput = _.bind(this.onInput, this);
		},

		allowBackgroundClick: function() {
			return false;
		},

		events: function() {
			return _.extend({
				"mousedown .item-slider": "onSliderMouseDown",
				"mouseup": "onSliderMouseUp",
				"change input": "onItemChange",
				"click .submit-button": "onSubmitClick"
			}, TextAndGraphic.prototype.events);
		},

		//TODO start range slider
		postRender: function(isFirstRender) {
			if(!isFirstRender) return;
			this.readyChildren = 0;
			var __ = this;
			this.$rangesliders = this.$('input[type="range"]').rangeslider({
				polyfill: false,
				onInit: function() {
					__.onInit(this);
				},
				onSlide: function(position, value) {
					__.onItemChange.call(__, { currentTarget: this.$element[0] });
				}
			}).on('input', this.onInput);
		},

		onInit: function(rangeslider) {
			var index = rangeslider.$element.attr("index");
			this.rangesliders[index] = rangeslider;
			rangeslider.$range.attr("index", index);
			this.readyChildren++;
			if (this.readyChildren == this.model._items.length) this.childrenReady();

			this.onItemSetup(index);

			this.renderScale();
		},


		renderScale : function(){			

			for(var i=0;i<this.model._items.length;i++){

				var item = this.model._items[i];

				$sliderScale = this.$('.slider-item[index="'+i+'"] .item-slider-scale-inner');			
				
				$sliderScale.append('<div class="item-slider-scale-left">'+(item.left||"")+'</div>');

				var min, count = 0;
				var max = item._max -item._min;
				var ratio = 100/max

				while(count <= max){					
					var left = count* ratio;
					$sliderScale.append('<div class="item-slider-scale-marker" data-index="'+(count+1)+'" style="left:'+left+'%"></div>');
					left = (count+0.5)*ratio;
					if (left > 100) break;
					$sliderScale.append('<div class="item-slider-scale-marker item-slider-scale-marker-half" style="left:'+left+'%"></div>');
					count++;
				}

				$sliderScale.append('<div class="item-slider-scale-right">'+(item.right||"")+'</div>');
			}

		},

		childrenReady: function() {

		},

		onItemSetup: function(index) {
			var item = this.model._items[index];
			if (item._showValueInHandle) {
				this.rangesliders[index].$range.addClass("showvalueinhandle");
				this.rangesliders[index].update(false, false);
			}
			this.putValueInHandle(index);
		},

		onInput: function(event, fromSlider) {
			var index = parseInt($(event.target).attr("index"));
			this.putValueInHandle(index);
		},

		putValueInHandle: function(index) {
			var item = this.model._items[index];
			if (item._showValueInHandle) {
				var $handle = this.rangesliders[index].$range.find('.rangeslider__handle');
				$handle[0].textContent = this.rangesliders[index].$element.val();
			}
		},

		onSliderMouseDown: function(e) {
			this._mouseDown = true;
		},

		onSliderMouseUp: function(e) {
			_.defer(_.bind(function() {
				this._mouseDown = false;
			}, this));
		},

		onItemChange: function(e) {
			if (!this.allowInteractions()) return;

			var $item = $(e.currentTarget);
			var index =  parseInt($item.attr("index"));

			var item = this.model._items[index];

			item.value = parseInt($item.val());

			this.parent.stateChanged();
			
		},

		onSubmitClick: function(e) {
			if (!this.allowInteractions()) return;

			this.model._hasMoved = false;
			
			if (this.model._onSubmitClick) {
				this.triggerRule(this.model._onSubmitClick);
			}

			if (this.model._endOnSubmitClick) {
				this.setEnded();
				if (!this.model._hasMoved) this.triggerContinue()
				this.remove();
			}

			this.model._hasMoved = false;

			this.parent.stateChanged();
		},

		finish: function() {
			this.$destroyRangesliders = this.$('input[type="range"]');
		},

		removed: function() {
			this.$destroyRangesliders.rangeslider("destroy");
		}

	}, {
		spriteName: "slider",
		template: "sprite-slider",

		setup: function(options, sprite) {
			var path = options.path;
				
			if (sprite._graphic && sprite._graphic) {
	            if (sprite._graphic.substr(0, path.length) !== path ) 
	                sprite._graphic = path + "/assets/" + sprite._graphic;   
	        }

	        if (sprite._backgroundGraphic && sprite._backgroundGraphic) {
	            if (sprite._backgroundGraphic.substr(0, path.length) !== path )
	                sprite._backgroundGraphic = path + "/assets/" + sprite._backgroundGraphic;   
	        }

		},

		preloadImages: function(returnSrcArray, sprite) {

			if (sprite._graphic && sprite._graphic) {
	            returnSrcArray.push(sprite._graphic);
	        }

	        if (sprite._backgroundGraphic && sprite._backgroundGraphic) {
	            returnSrcArray.push(sprite._backgroundGraphic);
	        }

		}
	});

	Sprite.loaded(Slider);

	return Slider;

});