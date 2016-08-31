// This should be executed in a mongo db env

//auctions_Dentarg
db.auctions_Dentarg.dropIndexes();

db.auctions_Dentarg.createIndex({timestamp:-1});
db.auctions_Dentarg.createIndex({item:1});
db.auctions_Dentarg.createIndex({owner:1, ownerRealm:1});
db.auctions_Dentarg.createIndex({timestamp:-1, item:1});

//For CSV export
db.getCollection('auctions_Dentarg').find({timestamp: {$type:1}}).forEach(function(row){
    row.timestamp = NumberLong(row.timestamp);
    db.getCollection('auctions_Dentarg').save(row);
    });
    
//mongoexport --db AuctionHouse --collection auctions_Dentarg --type=csv --fieldFile auctions.txt --out ./auctions_Dentarg.csv
//mongoexport --db AuctionHouse --collection item_library --type=csv --fieldFile items.txt --out ./wow_items.csv