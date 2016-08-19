//this will load items and users tables
require('console-stripe')(console);
const AppSettings = require('./AppSettings');
const MongoClient = require('../lib/MongoDbHelper.js');


function ItemsLoader(type) {

    //collections name
    this.itemsCollectionName = type === 'items' ? 'item_library' : 'user_library';
    this.ahCollectionName = 'auctions_' + AppSettings.realm;

    //arrays to store items from item table, ah table and list of rest to process items
    this.items = [];
    this.ahItems = [];
    this.remainingItems = [];
}

ItemsLoader.prototype.loadItems = function (collectionName, onSuccess, onError) {
    var $this = this;

    var mongoClient = new MongoClient();
    mongoClient.connect(getListOfItems(mongoClient), function(){
        console.error("ItemLoader cannot connecto to database");
        onError();
    });

    function getListOfItems(mongoClient) {
        console.info("Preparing to retrieve list of known items from table %s", $this.itemsCollectionName);
        var collection = mongoClient.collection(collectionName);

        //if we have items, than column is id, else is item
        var column = collectionName === $this.itemsCollectionName ? 'id' : 'item';
        console.info("Column name is %s", column);

        collection.distinct(column, function (error, results) {
            if (error !== null) {
                console.error("Error occured while quering the database, no data have been retrieved. The execution will stop.");
                onError();
            } else {
                if (collectionName === $this.itemsCollectionName) {
                    $this.items = results;
                } else {
                    $this.ahItems = results;
                }

                console.log("Found %d items in collection %s", results, collectionName);
                mongoClient.disconnect();
                onSuccess();
            }
        });
    }


}

module.exports = ItemsLoader;