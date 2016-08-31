CREATE TABLE `auctions_Dentarg` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` decimal(15,0) NOT NULL,
  `auction_id` int(10) NOT NULL,
  `item` int(5) NOT NULL,
  `owner` varchar(50) NOT NULL DEFAULT '',
  `ownerRealm` varchar(50) NOT NULL DEFAULT '',
  `bid` int(10) unsigned zerofill NOT NULL,
  `buyout` int(10) unsigned zerofill NOT NULL,
  `quantity` int(10) unsigned zerofill NOT NULL,
  `timeleft` varchar(10) NOT NULL DEFAULT '',
  `rand` int(10) DEFAULT NULL,
  `seed` int(10) DEFAULT NULL,
  `context` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auction` (`timestamp`,`auction_id`),
  KEY `item` (`item`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

CREATE TABLE `items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `item_id` int(10) NOT NULL,
  `name` varchar(100) NOT NULL DEFAULT '',
  `icon` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;