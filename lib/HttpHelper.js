const http = require('http');
const https = require('https');
const events = require('events');


function HttpHelper(ssl = true, onSuccess, onFail, onProgress) {

    //select http(s) based on the SSL flag
    this.httpObject = ssl === true ? https : http;

    //setup event emmiter
    this.eventEmmiter = new events.EventEmitter();

    //event types constants
    this.event = {
        success:'download_ready',
        fail:'download_failed',
        progress:'download_in_progress'
    };

    //link events
    this.eventEmmiter.on(this.event.success, onSuccess);
    this.eventEmmiter.on(this.event.fail, onFail);
    this.eventEmmiter.on(this.event.progress, onProgress);
    this.eventEmmiter.on(this.event.error, onFail);
}

HttpHelper.prototype.get = function(url) {
    var $this = this;

    //check if url is null or not and raise fail event
    if(url === null) {
        $this.eventEmmiter.emit($this.event.fail, Error(-1));
        return;
    }

    //make GET request
    $this.httpObject.get(url, function(response){
        var responseString = '';
       
        //if we cannot get data, trigger fail event
        if(response.status !== 200) {
            $this.eventEmmiter.emit($this.event.fail, response.status);
        }

        response.on('data', function(chunk) {
            //append the chunks to final response
            responseString += chunk.toString('utf8');
            
            //send the caller partial data we received
            $this.eventEmmiter.emit($this.event.progress, chunk);
        }).on('error', function(error) {
            //call fail event
            $this.eventEmmiter.emit($this.event.fail, error);
        }).on('end', function() {
            $this.eventEmmiter.emit($this.event.success, JSON.parse(responseString));
        });
    });
}



module.exports = HttpHelper;


var aux = new HttpHelper(true, function(data){
    console.log(data);
}, function(error) {
    console.error(error);
}, function(chunk) {
    console.log("Downloaded chunk of size: %d", chunk.length);
});

aux.get('https://www.googole.ro/');