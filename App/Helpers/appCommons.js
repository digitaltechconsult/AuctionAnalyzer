const sleep = require('sleep');

function AppCommons() {
    this.sleepTime = 1800;
}

AppCommons.prototype.getDateTime = function() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + " " + hour + ":" + min + ":" + sec;
}

AppCommons.prototype.recursiveCall = function(time, callback) {
    console.log("appCommons.js: Program will be continued after %d seconds\n", time);
    sleep.sleep(time);
    callback();
}

module.exports = AppCommons;