require( "console-stripe" )( console );
const sleep = require('sleep');

function AppCommons() {
    this.sleepTime = 3600;
    console.info("Default sleep time is %s seconds", this.sleepTime);
}

AppCommons.prototype.makeRecursiveCall = function(callback) {
    console.info("The app will sleep for %s seconds and then it will restart", this.sleepTime);
    sleep.sleep(this.sleepTime);
    callback();
}

module.exports = AppCommons;