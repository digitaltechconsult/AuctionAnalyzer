require('console-stripe')(console);
let MongoClient = require('../lib/MongoDbHelper');
let AppSettings = require('../app/AppSettings');

function DailySnapshot() { }

DailySnapshot.prototype.generateSnapshot = function (startDate = 7, endDate = 0, onSuccess, onError) {
    var mongoClient = new MongoClient();
    mongoClient.connect(onConnect, onError);

    var startTimestamp = Date.now() - (3600 * 1000 * 24 * startDate);
    var endTimestamp = Date.now() - (3600 * 1000 * 24 * endDate);

    function onConnect() {
        mongoClient.db.runCommand(
            {
                'aggregate': 'auctions_' + AppSettings.realm,
                'pipeline': [
                    {
                        '$match': { 'timestamp': { '$gte': startTimestamp, '$lte': endTimestamp } }
                    },
                    {
                        '$group': {
                            '_id': { 'item': '$item', 'timestamp': '$timestamp' },

                            'bidders': { '$sum': 1 },
                            'qty': { '$sum': '$quantity' },

                            'total_bid': { '$sum': '$bid' },
                            'total_buyout': { '$sum': '$buyout' },

                            'max_bid': { '$max': '$bid' },
                            'max_buyout': { '$max': '$buyout' },

                            'min_bid': { '$min': '$bid' },
                            'min_buyout': { '$min': '$buyout' },

                            'average_bid': { '$avg': '$bid' },
                            'average_buyout': { '$avg': '$buyout' }
                        }
                    },
                    {
                        '$sort': { 'timestamp': -1, 'qty': -1 }
                    }],
                    'allowDiskUse':true
            }

            , function (error, results) {
                if (error !== null) {
                    console.error("Error while executing aggregate function.");
                    onError();
                } else {
                    console.info("Operation was successfull.");
                    onSuccess(results);
                }
            });
    }

}

module.exports = DailySnapshot;

var x = new DailySnapshot();
x.generateSnapshot();