// This should be executed in a mongo db env

//auctions_Dentarg
db.auctions_Dentarg.dropIndexes();

db.auctions_Dentarg.createIndex({timestamp:-1});
db.auctions_Dentarg.createIndex({item:1});
db.auctions_Dentarg.createIndex({owner:1, ownerRealm:1});
db.auctions_Dentarg.createIndex({timestamp:-1, item:1});

