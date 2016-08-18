
var AppSettings = {
    realm: "Dentarg",
    locale: "en-us",
    apikey:"stu29wmafremfy7t8726s8qbs6p32643",
    ahUrl: function() {
        return "https://eu.api.battle.net/wow/auction/data/" + realm + "?locale=" + locale + "&apikey=" + key;
    },
    itemUrl: function(item) {
        return "https://eu.api.battle.net/wow/item/" + item + "?locale=" + locale + "&apikey=" + key
    }
}

module.exports = AppSettings;