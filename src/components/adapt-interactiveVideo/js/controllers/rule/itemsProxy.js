define([
    './itemProxy'
], function(ItemProxy) {

    var ItemsProxy = function(options) {
        var func = function(selector) {
            var item = _.findWhere(func.parent.items, {_id: selector});
            if (!item) {
                item = _.findWhere(func.parent.items, {_id: func._sprite._id + ":" + selector});
                if (!item) throw "Cannot find item " + selector;
            }
            if (!item) throw "Cannot find item " + index;
            var itemProxy = new ItemProxy({parent: func.parent});
            itemProxy._item = item;
            return itemProxy;
        };
        func.parent = options.parent;
        func._sprite = null;
        return _.extend(func, this);
    };
    
    ItemsProxy.prototype.value = function(id, value) {
        var items = this._sprite._items;
        var item = _.findWhere(items, {_id:id});
        if (!item) return null;
        if (value !== undefined) {
            item.value = value;
            return this;
        }
        return item.value;
    };

    ItemsProxy.prototype.select = function(id) {
        var all = (id === undefined);
        var items = this._sprite._items;

        if (all) {
            for (var i = 0, l = items.length; i < l; i++) {
                items[i].isSelected = true;
            }
        } else {
            var item = _.findWhere(items, {_id:id});
            if (!item) return null;
            item.isSelected = true;
        }

        this.parent.render();
    };

    ItemsProxy.prototype.deselect = function(id) {
        var all = (id === undefined);
        var items = this._sprite._items;

        if (all) {
            for (var i = 0, l = items.length; i < l; i++) {
                items[i].isSelected = false;
            }
        } else {
            var item = _.findWhere(items, {_id:id});
            if (!item) return null;
            item.isSelected = false;
        }

        this.parent.render();
    };

    ItemsProxy.prototype.visit = function(id) {
        var all = (id === undefined);
        var items = this._sprite._items;

        if (all) {
            for (var i = 0, l = items.length; i < l; i++) {
                items[i].isVisited = true;
            }
        } else {
            var item = _.findWhere(items, {_id:id});
            if (!item) return null;
            item.isVisited = true;
        }

        this.parent.render();
    };

    ItemsProxy.prototype.unvisit = function(id) {
        var all = (id === undefined);
        var items = this._sprite._items;

        if (all) {
            for (var i = 0, l = items.length; i < l; i++) {
                items[i].isVisited = false;
            }
        } else {
            var item = _.findWhere(items, {_id:id});
            if (!item) return null;
            item.isVisited = false;
        }

        this.parent.render();
    };

    ItemsProxy.prototype.enable = function(id) {
        var all = (id === undefined);
        var items = this._sprite._items;

        if (all) {
            for (var i = 0, l = items.length; i < l; i++) {
                items[i].isDisabled = false;
            }
        } else {
            var item = _.findWhere(items, {_id:id});
            if (!item) return null;
            item.isDisabled = false;
        }

        this.parent.render();
    };

    ItemsProxy.prototype.disable = function(id) {
        var all = (id === undefined);
        var items = this._sprite._items;

        if (all) {
            for (var i = 0, l = items.length; i < l; i++) {
                items[i].isDisabled = true;
            }
        } else {
            var item = _.findWhere(items, {_id:id});
            if (!item) return null;
            item.isDisabled = true;
        }

        this.parent.render();
    };

    return ItemsProxy;

});