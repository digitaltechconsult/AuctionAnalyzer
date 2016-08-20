require( "console-stripe" )( console );
const ChildProcess = require('child_process');
const sleep = require('sleep');

function AppCommons() {
    this.sleepTime = 1800;
    console.info("Default sleep time is %s seconds", this.sleepTime);
}

AppCommons.prototype.makeRecursiveCall = function(callback) {
    console.info("The app will sleep for %s seconds and then will restart", this.sleepTime);
    sleep.sleep(this.sleepTime);
    callback();
}

AppCommons.prototype.runScript = function(script, callback) {
    var invoked = false;
    var process = ChildProcess.fork(script);

    process.on('error', function(error) {
        if(invoked) return;
        invoked = true;
        console.warn("Cannot start process %s", script);
        callback(err);
    });

    process.on('exit', function(code) {
        if(invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code: ' + code);
        if(err) {
            console.warn("Process finished with error");
        }
        callback(err);
    });
}

module.exports = AppCommons;