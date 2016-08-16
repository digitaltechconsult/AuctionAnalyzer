const http = require('../Helpers/httpHelper.js');
const settings = require('./settings');
const MongoDBHelper = require('../Helpers/mongoDBHelper');
const log = require('single-line-log').stdout;
const _ = require('underscore');

function ItemLibrary() {
    this.collectionName = 'item_library';
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

ItemLibrary.prototype.updateItemList = function () {
    var $this = this;

    $this.getItemList().then(function () {
        
            $this.remaingItems.forEach(function (item) {
                var url = settings.itemApiUrl(item);

                function success(data) {
                    mongodb.connect(function () {
                        var itemData = JSON.parse(data);
                        var collection = mongodb.getCollection($this.collectionName);
                        //mongodb.insert(collection)
                    });
                }

                function error(e) {
                    console.error("items.js: updateItemList() - " + e);
                }

                http.get(url, success, error, true);
            });
    },
        function () {
            console.log("items.js: There is no need to update items database");
        })

}

module.exports = ItemLibrary;

var il = new ItemLibrary();
il.getItemList();


