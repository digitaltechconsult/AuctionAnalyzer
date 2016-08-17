const ItemLibrary = require('./AuctionHouse/items');
const AppCommons = require('./Helpers/appCommons');

function _main() {
    var library = new ItemLibrary('items');
    var appCommons = new AppCommons();

    library.updateItemList(function(){
        appCommons.recursiveCall(appCommons.sleepTime, _main);
    });
}

console.log("WoW Auction House Items Data Loader v.0.1");
_main();