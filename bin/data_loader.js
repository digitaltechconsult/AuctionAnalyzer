require( "console-stripe" )( console );
const AuctionLoader = require('../app/AuctionsLoader');
const AppCommons = require('../lib/AppCommons');

var appCommons = new AppCommons();

function _main() {
    console.info("Data Loader Process started");
    var auctionLoader = new AuctionLoader();
    auctionLoader.loadAuctions(function(){

        console.info("Starting Item Loader script");
        appCommons.runScript('./item_loader.js', function(err) {
            console.info("Item Loader script finished");
            console.info("Starting Char Loader script");
            appCommons.runScript('./char_loader.js', function(err) {
                console.info("Char Loader script finished");
                appCommons.makeRecursiveCall(_main);
            });
        });
    });
}

console.log("WoW Auction House Data Loader v.0.2");
_main();



