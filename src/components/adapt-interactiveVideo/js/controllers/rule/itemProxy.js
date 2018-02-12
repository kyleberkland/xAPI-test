define(function() {

    var ItemProxy = function(options) {
        this.parent = options.parent;
        this._item = null;

        Object.defineProperty(this, "isComplete", {

            get: function() {
                return this._item.__isComplete;
            }

        });

    };

    ItemProxy.prototype.complete = function() {
        this._item.__isComplete = true;
    };
    
    ItemProxy.prototype.select = function() {
        this._item.isSelected = true;
        this.parent.render();
    };

    ItemProxy.prototype.deselect = function() {
        this._item.isSelected = false;
        this.parent.render();
    };

    ItemProxy.prototype.visit = function() {
        this._item.isVisited = true;
        this.parent.render();
    };

    ItemProxy.prototype.unvisit = function() {
        this._item.isVisited = false;
        this.parent.render();
    };

    ItemProxy.prototype.enable = function() {
        this._item.isDisabled = false;
        this.parent.render();
    };

    ItemProxy.prototype.disable = function() {
        this._item.isDisabled = true;
        this.parent.render();
    };

    ItemProxy.prototype.value = function(val) {
        if (arguments.length !== 0) this._item.value = val;
        return this._item.value;
    };

    return ItemProxy;
    
});