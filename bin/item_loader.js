require('console-stripe')(console);
const ItemLoader = require('../app/ItemsLoader');

function _main() {
    var loader = new ItemLoader();
    loader.updateItemsList();
}
console.log("WoW Auction House Metadata (items) Data Loader v.0.2.1");
_main();