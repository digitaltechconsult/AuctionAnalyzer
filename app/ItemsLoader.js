//this will load items and users tables
require('console-stripe')(console);
const _ = require('underscore');
const AppSettings = require('./AppSettings');
const MongoClient = require('../lib/MongoDbHelper');
const Http = require('../lib/HttpHelper');

function ItemsLoader() {

    //collections name
    this.itemsCollectionName = 'item_library';
    this.ahCollectionName = 'auctions_' + AppSettings.realm;
}

ItemsLoader.prototype.loadItems = function (collectionName, onSuccess, onError) {
    var $this = this;

    var mongoClient = new MongoClient();
    mongoClient.connect(function () {
        console.info("Preparing to retrieve list of known items from table %s", collectionName);
        var collection = mongoClient.collection(collectionName);

        //if we have items, than column is id, else is item
        var column = collectionName === 'item_library' ? 'id' : 'item';
        console.info("Column name is %s", column);

        collection.distinct(column, function (error, results) {
            if (error !== null) {
                console.error("Error occured while quering the database, no data have been retrieved. The execution will stop.");
                onError();
            } else {
                console.log("Found %d items in collection %s", results.length, collectionName);
                mongoClient.disconnect(function () { });
                onSuccess(results);
            }
        });
    }, function () {
        console.error("ItemLoader cannot connecto to database");
        onError();
    });


}

ItemsLoader.prototype.generateUpdateList = function (onSuccess, onError) {
    var $this = this;

    $this.loadItems($this.itemsCollectionName, function (items) {
        $this.loadItems($this.ahCollectionName, function (ahItems) {
            remainingItems = _(ahItems).difference(items);
            if (remainingItems.length > 0) {
                console.log("Need to process %d items", remainingItems.length);
                onSuccess(remainingItems);
            } else {
                console.warn("No items to process, nothing to do");
                onError();
            }
        }, function (err) { //error from ahItems
            console.error("Error getting items from " + $this.ahCollectionName);
            onError();
        })
    }, function (err) { //error from items
        console.error("Error getting items from " + $this.itemsCollectionName);
        onError();
    });
}

ItemsLoader.prototype.updateItem = function (item, collection, onSuccess, onError) {
    var $this = this;

    console.info("Update information for item " + item);
    var http = new Http(true);
    var url = collection === 'item_library' ? AppSettings.itemUrl(item) : AppSettings.playerUrl(item);
    http.get(url, httpSuccess, httpFail, function () { });

    function httpFail(err) {
        //sometimes Blizzard doesn't send the required information
        if (err === 404) {
            var object = {
                id: item,
                name: "Item#" + item
            }
            console.warn("Item %s was not retrieved by using Blizzard API, saving it as '<not found'>");
            $this.insertItemInDatabase(object, collection, onSuccess, onError);
        } else {
            console.warn("Cannot retrieve item information from url %s", AppSettings.itemUrl(item));
            onError();
        }
    }

    function httpSuccess(data) {
        var object = JSON.parse(data);
        console.info("Retrieved item " + item);
        $this.insertItemInDatabase(object, collection, onSuccess, onError);
    }
}

ItemsLoader.prototype.insertItemInDatabase = function (item, collectionName, insertSuccess, insertFail) {
    var mongoClient = new MongoClient();
    mongoClient.connect(function () {
        var collection = mongoClient.collection(collectionName);
        collection.insert(item, function (error, result) {
            if (error !== null) {
                console.warn("Cannot insert item in the database");
                insertFail();
                return;
            } else {
                console.log("Item '%s' successfully inserted in database", item.name);
                mongoClient.disconnect(function () {
                    insertSuccess();
                });
            }
        });
    }, function () {
        console.warn("Cannot insert item in the database, is the database running?");
        insertFail();
        return;
    });
}

ItemsLoader.prototype.updateItemsList = function () {
    var $this = this;

    $this.generateUpdateList(function (items) {
        items.forEach(function (item, index) {
            setTimeout(function () {
                $this.updateItem(item, $this.itemsCollectionName, function () { }, function () { });
            }, 250 * index);
        });
    }, function (err) {
        console.warn("Item list was not updated");
    });
}

module.exports = ItemsLoader;
