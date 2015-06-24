-- MySQL dump 10.13  Distrib 5.1.68, for apple-darwin12.3.0 (i386)
--
-- Host: localhost    Database: seinam
-- ------------------------------------------------------
-- Server version	5.1.68

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accounts` (
  `customer_id` varchar(250) NOT NULL,
  `api_token` varchar(250) NOT NULL,
  `active` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`customer_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

CREATE UNIQUE INDEX accounts_api_token ON accounts(api_token);

--
-- Table structure for table `phone_numbers`
--

DROP TABLE IF EXISTS `phone_numbers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phone_numbers` (
  `number` varchar(255) NOT NULL,
  `display` varchar(512) NOT NULL,
  `validated` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `expires_at` datetime,
  PRIMARY KEY (`number`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


---
--- Triggers
---

DROP TRIGGER IF EXISTS `accounts_insert`;
CREATE TRIGGER `accounts_insert` BEFORE INSERT ON `accounts`
FOR EACH ROW SET NEW.updated_at := now();
DROP TRIGGER IF EXISTS `accounts_update`;
CREATE TRIGGER `accounts_update` BEFORE UPDATE ON `accounts`
FOR EACH ROW SET NEW.updated_at := now();


DROP TRIGGER IF EXISTS `phone_numbers_insert`;
DROP TRIGGER IF EXISTS `phone_numbers_update`;
DELIMITER //
CREATE TRIGGER `phone_numbers_insert` BEFORE INSERT ON `phone_numbers`
   FOR EACH ROW
   BEGIN
	  SET NEW.updated_at := now();
	  SET NEW.created_at := now();
	  IF NEW.expires_at IS NULL
	  THEN
	     IF NEW.validated = 1
	     THEN 
		    SET NEW.expires_at := DATE_ADD(now(), INTERVAL 30 day);
		 ELSE
		    SET NEW.expires_at := DATE_ADD(now(), INTERVAL 1 day);
		 END IF;
	  END IF;
   END;
//
DELIMITER ;
DELIMITER //
CREATE TRIGGER `phone_numbers_update` BEFORE UPDATE ON `phone_numbers`
   FOR EACH ROW
   BEGIN
	  SET NEW.updated_at := now();
	  IF NEW.expires_at IS NULL
	  THEN
	     IF NEW.validated = 1
	     THEN 
		    SET NEW.expires_at := DATE_ADD(now(), INTERVAL 30 day);
		 ELSE
		    SET NEW.expires_at := DATE_ADD(now(), INTERVAL 1 day);
		 END IF;
	  END IF;
   END;
//
DELIMITER ;

