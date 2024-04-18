-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: db_conn
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `connections`
--

DROP TABLE IF EXISTS `connections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip` varchar(255) DEFAULT NULL,
  `port` int(11) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_connection` timestamp NOT NULL DEFAULT current_timestamp(),
  `userid` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ip_userid` (`ip`,`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=233 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `connections`
--

LOCK TABLES `connections` WRITE;
/*!40000 ALTER TABLE `connections` DISABLE KEYS */;
INSERT INTO `connections` VALUES (1,'192.168.186.130',22,'usuario','usuario','2024-02-26 19:23:32','2024-03-16 16:32:48',NULL),(6,'192.168.1.125',22,'usuario','usuario','2024-02-26 20:04:23','2024-02-26 21:22:33',NULL),(33,'192.168.68.109',22,'usuario','usuario','2024-02-28 15:25:02','2024-02-28 15:25:02',NULL),(42,'172.21.10.10',22,'usuario','usuario','2024-03-03 18:54:12','2024-03-03 18:54:12',NULL),(43,'192.168.0.171',22,'usuario','usuario','2024-03-15 22:47:56','2024-03-18 11:05:46',NULL),(58,'192.168.68.196',22,'usuario','usuario','2024-03-19 09:39:49','2024-03-19 09:39:49',NULL),(59,'192.168.68.201',22,'usuario','usuario','2024-03-27 10:58:15','2024-03-27 11:15:21',NULL),(63,'192.168.186.128',22,'user','usuario','2024-03-30 09:41:37','2024-04-17 13:33:31',4),(65,'192.168.0.179',22,'usuario','usuario','2024-03-30 09:52:01','2024-03-30 11:37:28',NULL),(82,'192.168.0.188',22,'user','user','2024-03-30 14:00:47','2024-03-30 16:37:49',NULL),(90,'192.168.186.133',22,'usuario','usuario','2024-04-01 20:08:14','2024-04-03 20:17:10',NULL),(92,'192.168.186.132',22,'usuario','usuario','2024-04-02 09:08:15','2024-04-04 10:21:52',NULL),(192,'34.200.210.130',22,'admin','','2024-04-04 13:17:09','2024-04-08 13:38:32',NULL),(218,'192.168.186.128',22,'user','usuario','2024-04-16 15:39:27','2024-04-17 08:26:41',2),(225,'192.168.186.132',22,'usuario','usuario','2024-04-16 15:51:26','2024-04-16 15:51:26',2);
/*!40000 ALTER TABLE `connections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `lastlogin` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'test','test@test.com','$2a$08$j1Kbw6V3XS0VHwXSr9qJguJ7R1FnhEgrYBup2UlbVooFNF54oZIzu','2024-04-15 21:08:40'),(3,'tes2','test2@test.com','$2a$08$xQmT8ZbuGMTZ8IKYUqXXO.RYByzVeIr4l0YE5agMmT0Z9PbNdXxgK','2024-04-15 21:38:07'),(4,'Ahmed','ahmed@test.com','$2a$08$LSN1hHA.PlXZF8LNvOafHO03TKK6Elbb5e9BGkQqiHOJbSOrCPJG.','2024-04-16 09:45:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-04-18 11:13:33
