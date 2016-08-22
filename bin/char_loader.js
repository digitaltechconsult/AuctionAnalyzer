require('console-stripe')(console);
const CharacterLoader = require('../app/CharactersLoader');

function _main() {
    var loader = new CharacterLoader();
    loader.updateCharactersList();
}
console.log("WoW Auction House Metadata (characters) Data Loader v.0.1");
_main();