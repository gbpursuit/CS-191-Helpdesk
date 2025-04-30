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
-- Table structure for table `app_departments`
--

DROP TABLE IF EXISTS `app_departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_departments`
--

LOCK TABLES `app_departments` WRITE;
/*!40000 ALTER TABLE `app_departments` DISABLE KEYS */;
INSERT INTO `app_departments` VALUES (7,'Acting'),(9,'dd'),(5,'Executive'),(3,'IT'),(2,'Marketing'),(11,'test'),(1,'Unknown'),(4,'Warehouse');
/*!40000 ALTER TABLE `app_departments` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (3,'Google Chrome'),(2,'MS Office'),(1,'Unknown');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_delete_applications` AFTER DELETE ON `applications` FOR EACH ROW BEGIN
                UPDATE tasks
                SET applicationName = (SELECT id FROM applications WHERE name = 'Unknown' LIMIT 1)
                WHERE applicationName IS NULL;
            END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `approved_by`
--

DROP TABLE IF EXISTS `approved_by`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approved_by` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `full_name` varchar(200) GENERATED ALWAYS AS (trim(concat(coalesce(`first_name`,_utf8mb4''),_utf8mb4' ',coalesce(`last_name`,_utf8mb4'')))) STORED,
  `department` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `approved` (`department`),
  CONSTRAINT `approved` FOREIGN KEY (`department`) REFERENCES `app_departments` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approved_by`
--

LOCK TABLES `approved_by` WRITE;
/*!40000 ALTER TABLE `approved_by` DISABLE KEYS */;
INSERT INTO `approved_by` (`id`, `first_name`, `last_name`, `department`) VALUES (1,'Unknown','',1),(2,'John','Doe',3),(3,'Jane','Doe',2),(4,'Gavril','Coronel',4),(5,'Aisha','Go',5),(7,'Bianca','Amuraoo',7);
/*!40000 ALTER TABLE `approved_by` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_delete_approved_by` AFTER DELETE ON `approved_by` FOR EACH ROW BEGIN
                UPDATE tasks
                SET approvedBy = (SELECT id FROM approved_by WHERE full_name = 'Unknown' LIMIT 1)
                WHERE approvedBy IS NULL;
            END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `delete`
--

DROP TABLE IF EXISTS `delete`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delete` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deleted_value` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`deleted_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delete`
--

LOCK TABLES `delete` WRITE;
/*!40000 ALTER TABLE `delete` DISABLE KEYS */;
/*!40000 ALTER TABLE `delete` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Unknown','0'),(15,'Apple','1234');
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (4,'Asus Laptop'),(3,'Dell Desktop'),(1,'Unknown');
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_delete_devices` AFTER DELETE ON `devices` FOR EACH ROW BEGIN
                UPDATE tasks
                SET deviceName = (SELECT id FROM devices WHERE name = 'Unknown' LIMIT 1)
                WHERE deviceName IS NULL;
            END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `it_in_charge`
--

DROP TABLE IF EXISTS `it_in_charge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `it_in_charge` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `full_name` varchar(200) GENERATED ALWAYS AS (trim(concat(coalesce(`first_name`,_utf8mb4''),_utf8mb4' ',coalesce(`last_name`,_utf8mb4'')))) STORED,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `it_in_charge`
--

LOCK TABLES `it_in_charge` WRITE;
/*!40000 ALTER TABLE `it_in_charge` DISABLE KEYS */;
INSERT INTO `it_in_charge` (`id`, `first_name`, `last_name`) VALUES (1,'Unknown',''),(2,'Gavril','Coronel'),(3,'Lorraine','Castrillon'),(4,'Marcus','Pilapil'),(5,'Weng','Castrillon'),(6,'James Bond',''),(7,'testing',''),(9,'testing','more than'),(10,'Aisha','Go');
/*!40000 ALTER TABLE `it_in_charge` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_delete_it_in_charge` AFTER DELETE ON `it_in_charge` FOR EACH ROW BEGIN
                UPDATE tasks
                SET itInCharge = (SELECT id FROM it_in_charge WHERE full_name = 'Unknown' LIMIT 1)
                WHERE itInCharge IS NULL;
            END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (3,'Keyboard'),(5,'Laptop'),(1,'Unknown');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_delete_items` AFTER DELETE ON `items` FOR EACH ROW BEGIN
                UPDATE tasks
                SET itemName = (SELECT id FROM items WHERE name = 'Unknown' LIMIT 1)
                WHERE itemName IS NULL;
            END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `requested_by`
--

DROP TABLE IF EXISTS `requested_by`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requested_by` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `full_name` varchar(200) GENERATED ALWAYS AS (trim(concat(coalesce(`first_name`,_utf8mb4''),_utf8mb4' ',coalesce(`last_name`,_utf8mb4'')))) STORED,
  `department` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `requested` (`department`),
  CONSTRAINT `requested` FOREIGN KEY (`department`) REFERENCES `departments` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requested_by`
--

LOCK TABLES `requested_by` WRITE;
/*!40000 ALTER TABLE `requested_by` DISABLE KEYS */;
INSERT INTO `requested_by` (`id`, `first_name`, `last_name`, `department`) VALUES (1,'Unknown','',1),(6,'Steve','Jobs',15);
/*!40000 ALTER TABLE `requested_by` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_delete_requested_by` AFTER DELETE ON `requested_by` FOR EACH ROW BEGIN
                UPDATE tasks
                SET requestedBy = (SELECT id FROM requested_by WHERE full_name = 'Unknown' LIMIT 1)
                WHERE requestedBy IS NULL;
            END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
) ENGINE=InnoDB AUTO_INCREMENT=120 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_types`
--

LOCK TABLES `task_types` WRITE;
/*!40000 ALTER TABLE `task_types` DISABLE KEYS */;
INSERT INTO `task_types` VALUES (1,'Unknown','No Description'),(71,'Developer','Oracle Reports'),(72,'Documentation','IT Reference'),(74,'Job Request','Repair and Service Request'),(77,'Purchase','New Order or Replacement'),(81,'System Admin','Installation and Setup'),(86,'Technical','Troubleshooting and Client Assistance'),(99,'test','test'),(111,'test2','test'),(114,'test3','huehue'),(116,'test4','test'),(117,'test5','test'),(119,'test6','test');
/*!40000 ALTER TABLE `task_types` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_delete_task_types` AFTER DELETE ON `task_types` FOR EACH ROW BEGIN
                UPDATE tasks
                SET taskType = (SELECT id FROM task_types WHERE name = 'Unknown' LIMIT 1)
                WHERE taskType IS NULL;
            END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
  `itInCharge` int DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `departmentNo` varchar(50) DEFAULT NULL,
  `requestedBy` int DEFAULT NULL,
  `approvedBy` int DEFAULT NULL,
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
  CONSTRAINT `fk_applicationName` FOREIGN KEY (`applicationName`) REFERENCES `applications` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_approvedBy` FOREIGN KEY (`approvedBy`) REFERENCES `approved_by` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_deviceName` FOREIGN KEY (`deviceName`) REFERENCES `devices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_itemName` FOREIGN KEY (`itemName`) REFERENCES `items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_itInCharge` FOREIGN KEY (`itInCharge`) REFERENCES `it_in_charge` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_requestedBy` FOREIGN KEY (`requestedBy`) REFERENCES `requested_by` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_taskType` FOREIGN KEY (`taskType`) REFERENCES `task_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_chk_1` CHECK ((`severity` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,'9624','2025-04-05','New',1,86,'Troubleshooting and Client Assistance',7,'Apple','1234',6,1,1,1,1,'2025-04-05',NULL,NULL,NULL,'f','f'),(2,'0826','2025-04-05','New',1,1,'test',7,'Apple','1234',6,1,1,1,1,'2025-04-05',NULL,NULL,NULL,'f','f'),(3,'8495','2025-04-05','In Progress',1,1,'test',7,'Apple','1234',6,1,1,1,1,'2025-04-05',NULL,'2025-04-05',NULL,'f','f'),(4,'9638','2025-04-05','New',1,1,'test',7,'Apple','1234',6,1,1,1,1,'2025-04-05',NULL,NULL,NULL,'f','f'),(5,'4555','2025-04-05','New',1,1,'test',7,'Apple','1234',6,1,1,1,1,'2025-04-05',NULL,NULL,NULL,'g','g'),(6,'9198','2025-04-05','New',1,81,'Installation and Setup',7,'Apple','1234',6,1,1,1,1,'2025-04-05',NULL,NULL,NULL,'g','g'),(7,'4468','2025-04-05','New',1,86,'Troubleshooting and Client Assistance',7,'Apple','1234',6,1,1,1,1,'2025-04-05',NULL,NULL,NULL,'g','g'),(8,'7884','2025-04-05','New',1,74,'Repair and Service Request',7,'Apple','1234',6,1,1,1,1,'2025-04-05',NULL,NULL,NULL,'f','f'),(9,'0138','2025-04-05','New',1,72,'IT Reference',7,'Apple','1234',6,1,1,1,1,'2025-04-05',NULL,NULL,NULL,'f','f'),(10,'7199','2025-04-05','New',1,77,'New Order or Replacement',7,'Apple','1234',6,1,1,1,1,'2025-04-05',NULL,NULL,NULL,'d','f'),(11,'9201','2025-04-05','New',1,72,'IT Reference',7,'Apple','1234',6,1,1,1,1,'2025-04-05',NULL,NULL,NULL,'f','f'),(12,'0708','2025-04-06','New',1,86,'Troubleshooting and Client Assistance',3,'Apple','1234',6,1,1,1,1,'2025-04-06',NULL,NULL,NULL,'f','f'),(13,'8085','2025-04-06','Pending',1,77,'New Order or Replacement',2,'Apple','1234',6,1,1,1,1,'2025-04-06',NULL,NULL,NULL,'fg','f'),(14,'8182','2025-04-06','On Hold',1,99,'test',2,'Apple','1234',6,1,1,1,1,'2025-04-06',NULL,NULL,NULL,'f','f'),(15,'0115','2025-04-06','On Hold',1,86,'Troubleshooting and Client Assistance',2,'Apple','1234',6,1,1,1,1,'2025-04-06',NULL,NULL,NULL,'g','g'),(16,'0548','2025-04-06','On Hold',1,74,'Repair and Service Request',3,'Apple','1234',6,1,1,1,1,'2025-04-06',NULL,NULL,NULL,'f','f'),(17,'0951','2025-04-06','In Progress',1,99,'test',3,'Apple','1234',6,1,1,1,1,'2025-04-06',NULL,'2025-04-06',NULL,'g','g'),(18,'0210','2025-04-06','Pending',1,86,'Troubleshooting and Client Assistance',2,'Apple','1234',6,1,1,1,1,'2025-04-06',NULL,'2025-04-06','2025-04-06','f','f'),(19,'0188','2025-04-07','New',1,99,'test',3,'Apple','1234',6,1,1,1,1,'2025-04-07',NULL,NULL,NULL,'f','f'),(20,'8642','2025-04-09','New',1,99,'test',3,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'g','g'),(21,'3039','2025-04-09','New',1,81,'Installation and Setup',2,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'g','g'),(22,'8384','2025-04-09','New',1,74,'Repair and Service Request',3,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'f','f'),(23,'6514','2025-04-09','New',1,86,'Troubleshooting and Client Assistance',2,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'f','f'),(24,'5545','2025-04-09','New',1,99,'test',2,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'f','f'),(25,'3244','2025-04-09','New',1,74,'Repair and Service Request',3,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'f','f'),(26,'0892','2025-04-09','New',1,86,'Troubleshooting and Client Assistance',3,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'f','f'),(27,'7897','2025-04-09','New',1,81,'Installation and Setup',2,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'fedf','fef'),(28,'8900','2025-04-09','New',1,71,'Oracle Reports',2,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'afa','afafe'),(29,'6209','2025-04-09','New',1,86,'Troubleshooting and Client Assistance',2,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'dda','dada'),(30,'5957','2025-04-09','New',1,74,'Repair and Service Request',2,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'f','f'),(31,'3473','2025-04-09','New',1,99,'test',2,'Apple','1234',6,1,3,1,1,'2025-04-09',NULL,NULL,NULL,'f','f'),(32,'0779','2025-04-09','New',1,99,'test',2,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'fefef','fefeff'),(33,'3067','2025-04-09','New',1,86,'Troubleshooting and Client Assistance',2,'Apple','1234',6,1,1,1,3,'2025-04-09',NULL,NULL,NULL,'dadad','da'),(34,'5701','2025-04-09','New',1,74,'Repair and Service Request',2,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'f','f'),(35,'0571','2025-04-09','New',1,99,'test',2,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'f','f'),(36,'0663','2025-04-09','New',1,99,'test',2,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'f','f'),(37,'7140','2025-04-09','New',1,99,'test',2,'Apple','1234',6,1,1,1,1,'2025-04-09',NULL,NULL,NULL,'fff','fff'),(38,'0186','2025-04-10','New',1,86,'Troubleshooting and Client Assistance',3,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'g','g'),(39,'8677','2025-04-10','New',1,81,'Installation and Setup',3,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'g','g'),(40,'9784','2025-04-10','New',1,86,'Troubleshooting and Client Assistance',2,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','fz'),(41,'8104','2025-04-10','New',1,86,'Troubleshooting and Client Assistance',2,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'g','g'),(42,'8442','2025-04-10','New',1,99,'test',3,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','f'),(43,'3105','2025-04-10','New',1,71,'Oracle Reports',3,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','f'),(44,'5334','2025-04-10','New',1,99,'test',3,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','f'),(45,'0999','2025-04-10','New',1,77,'New Order or Replacement',3,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','f'),(46,'5758','2025-04-10','New',1,81,'Installation and Setup',3,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','f'),(47,'3529','2025-04-10','New',1,99,'test',2,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'g','g'),(48,'3307','2025-04-10','New',1,72,'IT Reference',3,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','f'),(49,'6225','2025-04-10','New',1,74,'Repair and Service Request',2,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'g','g'),(50,'3575','2025-04-10','New',1,99,'test',2,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','f'),(51,'7710','2025-04-10','New',1,86,'Troubleshooting and Client Assistance',2,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','f'),(52,'4628','2025-04-10','New',1,99,'test',3,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','f'),(53,'0876','2025-04-10','Pending',1,71,'Oracle Reports',2,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','f'),(54,'8066','2025-04-10','Pending',1,77,'New Order or Replacement',2,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','f'),(55,'9545','2025-04-10','Pending',1,81,'Installation and Setup',3,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'f','f'),(56,'9160','2025-04-10','Pending',1,99,'test',3,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'d','d'),(57,'5524','2025-04-10','Cancelled',1,81,'Installation and Setup',2,'Apple','1234',6,1,1,1,1,'2025-04-10',NULL,NULL,NULL,'g','g');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `full_name` varchar(200) GENERATED ALWAYS AS (trim(concat(coalesce(`first_name`,_utf8mb4''),_utf8mb4' ',coalesce(`last_name`,_utf8mb4'')))) STORED,
  `password` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `role` varchar(10) NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `unique_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `username`, `first_name`, `last_name`, `password`, `profile_image`, `role`) VALUES (2,'gbpursuit','Gavril','Coronel','$2b$10$EHuZvlb12dmGKfvkfNdOMO1rUVlggekpQ2SjZPWzr5RjEbzNnrZRm',NULL,'user'),(3,'ligayangligaya','Maam','Ligaya','$2b$10$jRTP3TsiU0h7kFxHM5V90.bSCsYQ5EDffv0oql6YXawwWkVEFGjmm',NULL,'user'),(4,'lmcastrillon','Lorraine','Castrillon','$2b$10$zgcSBog5ffbIMqJFtZAfXusbC8IXQngBGlFMQ6Gv2kscZgI/Slr0W',NULL,'user'),(5,'marcuspilapil','Marcus','Pilapil','$2b$10$yBtcrcNaJ0EirFFmThwI3OYus/sHEfHGgti1gkPZExUWdv7k6syb6',NULL,'user'),(8,'wengcastrillon','Weng','Castrillon','$2b$10$XyaLMW4N78GhDrQUkMHaI.WF1V91o8EDJ5wQfx5EGLo4Bp32IbsXu',NULL,'user');
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

-- Dump completed on 2025-04-28 18:00:00
