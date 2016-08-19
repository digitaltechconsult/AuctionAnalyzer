require( "console-stripe" )( console );
const AuctionLoader = require('../app/AuctionsLoader');
const AppCommons = require('../lib/AppCommons');

var appCommons = new AppCommons();

function _main() {
    console.info("Data Loader Process started");
    var auctionLoader = new AuctionLoader();
    auctionLoader.loadAuctions(function(){
        appCommons.makeRecursiveCall(_main);
    });
}

console.log("WoW Auction House Data Loader v.0.2");
_main();



