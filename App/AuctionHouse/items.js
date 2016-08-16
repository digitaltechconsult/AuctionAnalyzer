const http = require('../Helpers/httpHelper.js');
const settings = require('./settings');
const MongoDBHelper = require('../Helpers/mongoDBHelper');
const log = require('single-line-log').stdout;
const _ = require('underscore');

function ItemLibrary() {
    this.collectionName = 'item_library';
    this.items = [];
    this.ahItems = [];
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
                    fulfill(results);
                }
            });
        });
    });
}

module.exports = ItemLibrary;

var il = new ItemLibrary();


