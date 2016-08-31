require('console-stripe')(console);
const log = require('single-line-log').stdout;
let MongoClient = require('../lib/MongoDbHelper');
let MySQL = require('mysql');
let AppSettings = require('../app/AppSettings');
var Promise = require('promise');

mongoClient = new MongoClient();
mysql = MySQL.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'AuctionHouse'
});

mongoClient.connect(onConnect, onError);

function onConnect() {
    mysql.connect(function (err) {
        if (err) {
            console.error("Error connecting to MySQL Database.");
            return;
        }
        console.info("Connected to MySQL Database");
        var collection = mongoClient.collection('auctions_' + AppSettings.realm);
        collection.distinct('timestamp', function (err, results) {
            var promises = [];
            results.forEach(function (result) {
                console.info("Selecting timestamp " + result);
                promises.push(updateDatabase(result));
            });
            for(var i=1;i<promises.length;i++) {
                var prev = promises[i-1];
                var current = promises[i];
                prev.done(function() {
                    Promise.resolve(current);
                });
                prev.catch(function(err) {
                    console.warn(err);
                });
            }
            promises[promises.length - 1].then(function() {
                console.info("All, done");
                 mysql.end();
                    console.info("MySQL connection closed");
                    mongoClient.disconnect(function () {
                        console.info("Mongo disconnected!");
                    });
            });
        });
    });
}

function updateDatabase(timestamp) {
    return new Promise(function (fulfill, reject) {

        var collection = mongoClient.collection('auctions_' + AppSettings.realm);
        collection.find({ 'timestamp': timestamp }).sort({ timestamp: 1 }).toArray(function (err, results) {
            if (err) {
                console.error("Error getting results from MongoDB");
                mongoClient.disconnect(function () { });
            } else {
                var promises = [];
                console.info("Creating MySQL inserts for timestamp " + timestamp + "...");
                results.forEach(function (result, index) {
                    log("Statement progress: " + Math.round(100 * index / results.length) + "% for timestamp " + timestamp + "\n");
                    var row = {
                        timestamp: result.timestamp,
                        auction_id: result.id,
                        item: result.item,
                        owner: result.owner,
                        ownerRealm: result.ownerRealm,
                        bid: result.bid,
                        buyout: result.buyout,
                        quantity: result.quantity,
                        timeleft: result.timeleft,
                        rand: result.rand,
                        seed: result.seed,
                        context: result.context
                    };
                    promises.push(insertMySQL(row, index));
                });

                Promise.all(promises).then(function () {
                    console.log("Migration finised (%s records) !", promises.length);
                    fulfill();
                }, function (error) {
                    console.warn("Something went wrong: " + error);
                });
            }
        });
    });
}

function onError() { }

function insertMySQL(row, index) {
    return new Promise(function (fulfill, reject) {
        setTimeout(function () {
            mysql.query('insert into auctions_' + AppSettings.realm + ' set ?', row, function (err, result) {
                if (err !== null) {
                    console.warn("Error inserting row into MySQL database:" + err);
                } else {
                    console.log("Successfully inserted row into MySQL database: " + JSON.stringify(row));
                    fulfill();
                }
            });
        }, index * 10);
    });
}