
var AppSettings = {
    realm: "Dentarg",
    locale: "en-us",
    apikey:"stu29wmafremfy7t8726s8qbs6p32643",
    ahUrl: function() {
        return "https://eu.api.battle.net/wow/auction/data/" + this.realm + "?locale=" + this.locale + "&apikey=" + this.apikey;
    },
    itemUrl: function(item) {
        return "https://eu.api.battle.net/wow/item/" + item + "?locale=" + this.locale + "&apikey=" + this.apikey;
    },

    playerUrl: function(realm, character) {
        return 'https://eu.api.battle.net/wow/character/' + realm + '/' + character + '?locale=' + this.locale + '&apikey=' + this.apikey;
    }
}

module.exports = AppSettings;