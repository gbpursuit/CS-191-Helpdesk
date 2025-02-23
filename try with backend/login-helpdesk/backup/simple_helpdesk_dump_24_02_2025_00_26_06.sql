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
) ENGINE=InnoDB AUTO_INCREMENT=1951 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1439,'EK3V','2025-02-09','Open','3','hello','Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.','Weng Castrillon','Executive','--','h','--','--','--','--',NULL,NULL,NULL,NULL),(1440,'Z9DF','2025-02-18','Open','2','--','--','Weng Castrillon','Executive','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1441,'MUP8','2025-02-18','In Progress','3','HELOOOOOOOOOOO','HAHAHAH','Weng Castrillon','Executive','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1442,'X1HD','2025-02-18','Closed','2','firefox baby','--','Anne Ranay','Marketing','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1443,'31YL','2025-02-19','In Progress','2','ughhh','--','Anne Ranay','Warehouse','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1444,'XRHC','2025-02-09','On Hold','3','--','--','Anne Ranay','Marketing','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1445,'NUKQ','2025-02-09','Closed','3','--','--','Anne Ranay','Executive','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1446,'RKQ5','2025-02-19','In Progress','1','--','--','Julius Jara','Executive','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1447,'Q4BJ','2025-02-19','Open','2','haha','--','Anne Ranay','Marketing','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1448,'VPL3','2025-02-09','In Progress','3','--','--','Anne Ranay','Executive','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1449,'G5PT','2025-02-21','Open','4','test 1','--','Anne Ranay','Executive','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1450,'UTQY','2025-02-21','In Progress','1','test 2','--','Weng Castrillon','Executive','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1451,'H8HN','2025-02-21','Closed','4','hello task 3','--','Anne Ranay','Marketing','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1452,'AQ55','2025-02-21','In Progress','1','task 4','--','Anne Ranay','Executive','g','--','--','--','--','--',NULL,NULL,NULL,NULL),(1453,'VTI4','2025-02-21','Closed','2','task 5','--','Anne Ranay','Marketing','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1454,'HLPS','2025-02-21','In Progress','3','task 6','hi thereee','Weng Castrillon','Executive','--','gg','--','--','--','--',NULL,NULL,NULL,NULL),(1455,'2TC5','2025-02-22','Closed','2','task 7','--','Weng Castrillon','Marketing','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1473,'2SIZ','2025-02-11','Closed','4','d','Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.','Weng Castrillon','Marketing','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1479,'SSNR','2025-02-22','In Progress','2','test','--','Anne Ranay','Marketing','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1491,'AL96','2025-02-22','In Progress','2','testing with pdf','--','Anne Ranay','Marketing','--','WOMSADC','--','--','--','--',NULL,NULL,NULL,NULL),(1492,'LX3F','2025-02-22','Open','1','ggaa','--','Weng Castrillon','Marketing','--','--','--','--','--','--',NULL,NULL,NULL,NULL),(1884,'5HV5','2025-02-23','Open','5','Product Details','--','Anne Ranay','IT','--','Gavril Coronel','--','--','--','--',NULL,NULL,NULL,NULL);
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

-- Dump completed on 2025-02-24  0:26:07
