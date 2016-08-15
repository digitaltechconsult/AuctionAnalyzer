const MongoDBHelper = require('./Helpers/mongoDBHelper');
const AuctionHouseWebLoader = require('./AuctionHouse/AuctionHouseWebLoader');
const Auctions = require('./AuctionHouse/auctions.js');
const log = require('single-line-log').stdout;
const sleep = require('sleep');
const AppCommons = require('./Helpers/appCommons');

var appCommons = new AppCommons();

function _main() {
    console.log("%s app.js: _main() function called, starting database update.", appCommons.getDateTime());
    var mongodb = new MongoDBHelper();
    var ahwl = new AuctionHouseWebLoader();

    mongodb.connect(function () {
        ahwl.getAuctionHouseFile(function () {
            ahwl.readAuctionHouseFiles(function () {
                var auctions = new Auctions();
                auctions.readBlizzardData(ahwl.ahData);
                mongodb.insert(auctions.collection, function () {
                    mongodb.disconnect();
                    appCommons.recursiveCall(1800, _main);
                });
            }, function (e) {
                console.log("app.js: No data updated.");
                mongodb.disconnect();
                appCommons.recursiveCall(1800, _main);
            });
        });
    }, 
    function() {
        appCommons.recursiveCall(1800, _main);
    });
}

console.log("WoW Auction House Data Loader v.0.1");
_main();



