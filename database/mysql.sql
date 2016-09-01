CREATE TABLE `auctions_dentarg` (
  `timestamp` decimal(15,0) NOT NULL,
  `id` int(10) NOT NULL,
  `item` int(5) NOT NULL,
  `owner` varchar(50) NOT NULL DEFAULT '',
  `ownerRealm` varchar(50) NOT NULL DEFAULT '',
  `bid` decimal(20,2) unsigned zerofill NOT NULL,
  `buyout` decimal(20,2) unsigned zerofill NOT NULL,
  `quantity` int(10) unsigned zerofill NOT NULL,
  `timeleft` varchar(10)  DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `items` (
  `id` int(10) NOT NULL,
  `name` varchar(100) NOT NULL DEFAULT '',
  `icon` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;