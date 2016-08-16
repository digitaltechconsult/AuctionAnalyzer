const http = require('../Helpers/httpHelper.js');
const settings = require('./settings');
const MongoDBHelper = require('../Helpers/mongoDBHelper');
const log = require('single-line-log').stdout;
const _ = require('underscore');
const sleep = require('sleep');

function ItemLibrary(type) {
    this.collectionName = type === 'items' ? 'item_library' : 'user_library';
    this.collectionRealm = 'auctions_' + settings.realm;
    this.ahItems = [];
    this.items = [];
    this.remaingItems = [];
}

ItemLibrary.prototype.loadItems = function (collectionName) {
    var $this = this;

    return new Promise(function (fulfill, reject) {
        var mongodb = new MongoDBHelper();
        mongodb.connect(function () {
            console.log("items.js: Preparing to load items from collection " + collectionName);
            var collection = mongodb.getCollection(collectionName);
            var column = collectionName === $this.collectionName ? 'id' : 'item';

            collection.distinct(column, function (error, results) {
                if (error !== null) {
                    console.error("items.js: loadItems() - " + error);
                    reject(error);
                    mongodb.disconnect();
                } else {
                    if (collectionName === $this.collectionName) {
                        $this.items = results;
                    } else {
                        $this.ahItems = results;
                    }
                    console.log("items.js: Found %d items in collection %s", results.length, collectionName);
                    mongodb.disconnect();
                    fulfill();
                }
            });
        });
    });
}

ItemLibrary.prototype.getItemList = function () {
    var $this = this;

    return new Promise(function (fulfill, reject) {
        var itemPromise = $this.loadItems($this.collectionName);
        var ahItemPromise = $this.loadItems($this.collectionRealm);

        itemPromise.then(ahItemPromise.then(function () {
            $this.remaingItems = _($this.ahItems).difference($this.items);
            if ($this.remaingItems.length > 0) {
                console.log("items.js: Remaining %d items to download from Blizzard.", $this.remaingItems.length);
                fulfill();
            } else {
                console.log("items.js: 0 items to update.");
                reject();
            }
        }));
    });
}

ItemLibrary.prototype.updateItem = function (item) {
    var $this = this;
    return new Promise(function (fulfill, reject) {

        console.log("items.js: Preparing to update item " + item);
        var url = settings.itemApiUrl(item);

        function success(data) {
            console.log("items.js: Data retrieved, preparing to save it in database");
            var mongodb = new MongoDBHelper();
            mongodb.connect(function () {
                var itemData = JSON.parse(data);
                var collection = mongodb.getCollection($this.collectionName);
                mongodb.insert(collection, itemData, function () {
                    console.log("items.js: Row with id %d inserted into database", itemData.id);
                    mongodb.disconnect();
                    fulfill();
                });
            });
        }

        function error(e) {
            console.error("items.js: updateItemList() - " + e);
            reject(e);
        }

        console.log("items.js: Requesting url: " + url);
        http.get(url, success, error, true);
    });
}

ItemLibrary.prototype.updateItemList = function () {
    var $this = this;

    var promises = [];
    $this.getItemList().then(function () {
        
        if ($this.remaingItems.length === 0) {
            return;
        }

        var size = $this.remaingItems.length < 50 ? $this.remaingItems.length : 50;
        for (j = 0; j < size; j++) {
            var item = $this.remaingItems[j];
            promises.push($this.updateItem(item));
        }

        Promise.all(promises).then(function () {
        console.log("items.js: %d items have been updated", size);
        
        //recursive call, hope there is an error to exit loop
        $this.updateItemList();
        }).catch(function (e) {
            console.error("items.js: Promise.all.updateItemList() - " + e);
        });
    },
        function (e) {
            console.error("items.js: updateItemList() - " + e);
        }
    );
}

module.exports = ItemLibrary;

var il = new ItemLibrary('items');
il.updateItemList();


