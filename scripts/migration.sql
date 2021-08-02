USE stack_overflow_v2;

CREATE TABLE `agencies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shortname` varchar(255) NOT NULL,
  `longname` varchar(255) NOT NULL,
  `logo` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

ALTER TABLE users
ADD agencyId int;

ALTER TABLE users
ADD displayname varchar(255);

ALTER TABLE tokens 
CHANGE email contact text;

ALTER TABLE users
ADD phonenumber varchar(255);
