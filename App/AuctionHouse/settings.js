//battle.net settings

const realm = "Dentarg"
const locale = "en-us"
const key = "stu29wmafremfy7t8726s8qbs6p32643"
const url = "https://eu.api.battle.net/wow/auction/data/"

exports.apiURL = url + realm + "?locale=" + locale + "&apikey=" + key
exports.realm = realm;