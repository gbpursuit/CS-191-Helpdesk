-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: localhost    Database: simple_helpdesk
-- ------------------------------------------------------
-- Server version	8.0.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `taskId` varchar(10) NOT NULL,
  `taskDate` date DEFAULT NULL,
  `taskStatus` varchar(50) DEFAULT NULL,
  `severity` varchar(50) DEFAULT NULL,
  `taskType` varchar(100) DEFAULT NULL,
  `taskDescription` text,
  `itInCharge` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `departmentNo` varchar(100) DEFAULT NULL,
  `requestedBy` varchar(100) DEFAULT NULL,
  `approvedBy` varchar(100) DEFAULT NULL,
  `itemName` varchar(100) DEFAULT NULL,
  `deviceName` varchar(100) DEFAULT NULL,
  `applicationName` varchar(100) DEFAULT NULL,
  `dateReq` date DEFAULT NULL,
  `dateRec` date DEFAULT NULL,
  `dateStart` date DEFAULT NULL,
  `dateFin` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `taskId` (`taskId`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (2,'0T5N','2025-02-24','Cancelled','1','Finish Document','--','Weng Castrillon','IT','--','Gavril Coronel','--','--','--','--','2025-02-24',NULL,'2025-02-24','2025-02-24'),(3,'P4KS','2025-02-24','Completed','1','Read Document','--','Anne Ranay','IT','--','Lorraine Castrillon','--','--','--','--','2025-02-24',NULL,'2025-02-24','2025-02-24'),(8,'FRC3','2025-02-24','On Hold','1','g','--','Weng Castrillon','Marketing','--','g','--','--','--','--','2025-02-24',NULL,NULL,NULL),(9,'LQ0L','2025-02-24','In Progress','1','g','--','Weng Castrillon','Marketing','--','g','--','--','--','--','2025-02-24',NULL,'2025-02-24',NULL),(10,'AHE9','2025-02-24','Pending','1','b','--','Julius Jara','Marketing','--','b','--','--','--','--','2025-02-24',NULL,NULL,NULL),(11,'SPAF','2025-02-24','New','1','f','--','Weng Castrillon','Warehouse','--','e','--','--','--','--','2025-02-24',NULL,NULL,NULL);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `username` varchar(100) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('gbpursuit','Gavril','Coronel','$2b$10$EHuZvlb12dmGKfvkfNdOMO1rUVlggekpQ2SjZPWzr5RjEbzNnrZRm',NULL),('ligayangligaya','Maam','Ligaya','$2b$10$jRTP3TsiU0h7kFxHM5V90.bSCsYQ5EDffv0oql6YXawwWkVEFGjmm',NULL),('lmcastrillon','Lorraine','Castrillon','$2b$10$zgcSBog5ffbIMqJFtZAfXusbC8IXQngBGlFMQ6Gv2kscZgI/Slr0W',NULL),('marcuspilapil','Marcus','Pilapil','$2b$10$yBtcrcNaJ0EirFFmThwI3OYus/sHEfHGgti1gkPZExUWdv7k6syb6',NULL),('testing','Test','Account','$2b$10$9FW.AnfFWHTdrnFPp3Pgouf7UcfS9ja1KPfGPPpT.adVUp67evAIu',NULL),('wengcastrillon','Weng','Castrillon','$2b$10$XyaLMW4N78GhDrQUkMHaI.WF1V91o8EDJ5wQfx5EGLo4Bp32IbsXu',NULL);
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

-- Dump completed on 2025-02-24 23:15:14
