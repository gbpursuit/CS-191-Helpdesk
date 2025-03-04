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
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (2,'Google Chrome'),(1,'MS Office');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `department_no` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `department_no` (`department_no`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Unknown','0'),(2,'IT','123'),(3,'Marketing','321');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (1,'Acer Laptop'),(2,'Dell Desktop');
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `it_in_charge`
--

DROP TABLE IF EXISTS `it_in_charge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `it_in_charge` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `it_in_charge`
--

LOCK TABLES `it_in_charge` WRITE;
/*!40000 ALTER TABLE `it_in_charge` DISABLE KEYS */;
INSERT INTO `it_in_charge` VALUES (2,'Anne Ranay'),(7,'gg'),(1,'Weng Castrillon');
/*!40000 ALTER TABLE `it_in_charge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (2,'Keyboard'),(1,'Monitor');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_types`
--

DROP TABLE IF EXISTS `task_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_types`
--

LOCK TABLES `task_types` WRITE;
/*!40000 ALTER TABLE `task_types` DISABLE KEYS */;
INSERT INTO `task_types` VALUES (1,'Bug Fix',NULL),(2,'Feature Request',NULL),(3,'Hardware Issue',NULL);
/*!40000 ALTER TABLE `task_types` ENABLE KEYS */;
UNLOCK TABLES;

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
  `severity` tinyint NOT NULL,
  `taskType` int DEFAULT NULL,
  `taskDescription` text,
  `itInCharge` varchar(100) DEFAULT NULL,
  `department` int DEFAULT NULL,
  `departmentNo` varchar(50) DEFAULT NULL,
  `requestedBy` varchar(100) DEFAULT NULL,
  `approvedBy` varchar(100) DEFAULT NULL,
  `itemName` int DEFAULT NULL,
  `deviceName` int DEFAULT NULL,
  `applicationName` int DEFAULT NULL,
  `dateReq` date DEFAULT NULL,
  `dateRec` date DEFAULT NULL,
  `dateStart` date DEFAULT NULL,
  `dateFin` date DEFAULT NULL,
  `problemDetails` text,
  `remarks` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `taskId` (`taskId`),
  KEY `taskType` (`taskType`),
  KEY `department` (`department`),
  KEY `itemName` (`itemName`),
  KEY `deviceName` (`deviceName`),
  KEY `applicationName` (`applicationName`),
  KEY `fk_it_in_users` (`itInCharge`),
  KEY `fk_requested_by` (`requestedBy`),
  KEY `fk_approved_by` (`approvedBy`),
  CONSTRAINT `fk_approved_by` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`username`) ON DELETE SET NULL,
  CONSTRAINT `fk_it_in_users` FOREIGN KEY (`itInCharge`) REFERENCES `users` (`username`) ON DELETE SET NULL,
  CONSTRAINT `fk_requested_by` FOREIGN KEY (`requestedBy`) REFERENCES `users` (`username`) ON DELETE SET NULL,
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`taskType`) REFERENCES `task_types` (`id`),
  CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`department`) REFERENCES `departments` (`id`),
  CONSTRAINT `tasks_ibfk_4` FOREIGN KEY (`itemName`) REFERENCES `items` (`id`),
  CONSTRAINT `tasks_ibfk_5` FOREIGN KEY (`deviceName`) REFERENCES `devices` (`id`),
  CONSTRAINT `tasks_ibfk_6` FOREIGN KEY (`applicationName`) REFERENCES `applications` (`id`),
  CONSTRAINT `tasks_chk_1` CHECK ((`severity` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,'9242','2025-03-04','Pending',1,3,'Task Trying','g',3,'321','gbpursuit','gbpursuit',2,2,2,'2025-03-04',NULL,NULL,NULL,'Helolo','GRGr'),(2,'6061','2025-03-04','New',1,2,'--','g',3,'321','ligayangligaya','newDummy',1,2,1,'2025-03-04',NULL,NULL,NULL,'FEF','FEFEF'),(3,'6348','2025-03-04','Closed',1,2,'Testing Again','newDummy',2,'123','wengcastrillon','ligayangligaya',2,1,2,'2025-03-04',NULL,NULL,NULL,'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.','test');
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
  `full_name` varchar(200) GENERATED ALWAYS AS (trim(concat(coalesce(`first_name`,_utf8mb4''),_utf8mb4' ',coalesce(`last_name`,_utf8mb4'')))) STORED,
  `password` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `role` varchar(10) NOT NULL DEFAULT 'user',
  `department` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`username`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`username`, `first_name`, `last_name`, `password`, `profile_image`, `role`, `department`) VALUES ('g','gg',NULL,'$2b$10$3h8pXvvb5vp.IDXSWlntVuANYQhatVSL17DTeRY4ERbniAyKc5qVi','/uploads/1739424354251_hahahah-burn.gif','user',1),('gbpursuit','Gavril','Coronel','$2b$10$EHuZvlb12dmGKfvkfNdOMO1rUVlggekpQ2SjZPWzr5RjEbzNnrZRm',NULL,'user',1),('ligayangligaya','Maam','Ligaya','$2b$10$jRTP3TsiU0h7kFxHM5V90.bSCsYQ5EDffv0oql6YXawwWkVEFGjmm',NULL,'user',1),('lmcastrillon','Lorraine','Castrillon','$2b$10$zgcSBog5ffbIMqJFtZAfXusbC8IXQngBGlFMQ6Gv2kscZgI/Slr0W',NULL,'user',1),('marcuspilapil','Marcus','Pilapil','$2b$10$yBtcrcNaJ0EirFFmThwI3OYus/sHEfHGgti1gkPZExUWdv7k6syb6',NULL,'user',1),('newDummy','Dummy','Account','$2b$10$wLd1fUHoXqc7Sg7N4GOz2u4ZpHCkyCcBp/51IT0FVgfu6rxfFNueW',NULL,'user',1),('testing','Test','Account','$2b$10$9FW.AnfFWHTdrnFPp3Pgouf7UcfS9ja1KPfGPPpT.adVUp67evAIu',NULL,'user',1),('wengcastrillon','Weng','Castrillon','$2b$10$XyaLMW4N78GhDrQUkMHaI.WF1V91o8EDJ5wQfx5EGLo4Bp32IbsXu',NULL,'user',1);
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

-- Dump completed on 2025-03-04 13:37:01
