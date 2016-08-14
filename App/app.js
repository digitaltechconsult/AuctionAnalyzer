const MongoDBHelper = require('./Helpers/mongoDBHelper');
const AuctionHouseWebLoader = require('./AuctionHouse/AuctionHouseWebLoader');
const Auctions = require('./AuctionHouse/auctions.js');
const log = require('single-line-log').stdout;
const sleep = require('sleep');

function _main() {
    console.log("app.js: _main() function called, starting database update.");
    var mongodb = new MongoDBHelper();
    var ahwl = new AuctionHouseWebLoader();

    mongodb.connect(function () {

        //insert
        ahwl.getAuctionHouseFile(function () {
            ahwl.readAuctionHouseFiles(function () {
                var auctions = new Auctions();
                auctions.readBlizzardData(ahwl.ahData);
                mongodb.insert(auctions.collection, function () {
                    mongodb.disconnect();
                    recursiveCall();
                });
            }, function (e) {
                console.log("app.js: No data updated.");
                mongodb.disconnect();
                recursiveCall();
            });
        });
    });
}

function recursiveCall() {
    sleep.sleep(1800); //call the update twice an hour
    console.log("\n");
    _main();
}

console.log("WoW Auction House Data Loader v.0.1");
_main();


