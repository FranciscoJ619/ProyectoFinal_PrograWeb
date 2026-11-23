-- MySQL dump 10.13  Distrib 9.7.2, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: replay_club
-- ------------------------------------------------------
-- Server version	9.7.2

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
-- Current Database: `replay_club`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `replay_club` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `replay_club`;

--
-- Table structure for table `comentarios_foro`
--

DROP TABLE IF EXISTS `comentarios_foro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentarios_foro` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contenido` varchar(800) COLLATE utf8mb4_unicode_ci NOT NULL,
  `publicacion_id` bigint NOT NULL,
  `autor_id` bigint NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_comentarios_publicacion` (`publicacion_id`),
  KEY `fk_comentarios_autor` (`autor_id`),
  CONSTRAINT `fk_comentarios_autor` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_comentarios_publicacion` FOREIGN KEY (`publicacion_id`) REFERENCES `publicaciones_foro` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios_foro`
--

LOCK TABLES `comentarios_foro` WRITE;
/*!40000 ALTER TABLE `comentarios_foro` DISABLE KEYS */;
INSERT INTO `comentarios_foro` VALUES (1,'¡Lo primero que construí fue un carrito con ventiladores!',1,4,'2026-11-22 20:45:50'),(2,'Yo un puente para cruzar el cañón, jaja.',1,5,'2026-11-22 20:55:50'),(3,'Totalmente de acuerdo, el mundo es enorme.',1,10,'2026-11-22 21:05:50'),(4,'Diego siempre es puntual, confirmo.',2,8,'2026-11-22 02:15:50'),(5,'Gracias Valeria, fue un gusto.',2,5,'2026-11-22 03:15:50'),(6,'Chrono Trigger de SNES. Nunca lo vendería.',3,15,'2026-11-21 18:15:50'),(7,'Mi Pokémon Rojo con la caja original.',3,7,'2026-11-21 19:15:50'),(8,'Ocarina of Time, fue mi primer juego.',3,6,'2026-11-21 20:15:50'),(9,'Las islas del cielo son lo mejor.',4,4,'2026-11-20 22:15:50'),(10,'La pelea contra Hornet me costó la vida, jaja.',5,11,'2026-11-19 22:15:50'),(11,'El final me hizo llorar.',6,7,'2026-11-18 22:15:50'),(12,'¿Qué build usaste al inicio?',7,10,'2026-11-17 22:15:50'),(13,'Fuerza y espadón, sin pensarlo.',7,6,'2026-11-17 22:15:50'),(14,'Gracias Luis, ¡vuelve cuando quieras!',9,4,'2026-10-12 22:15:50'),(15,'Yo uso una vitrina cerrada, ayuda con el polvo.',13,15,'2026-11-22 21:45:50'),(16,'Overcooked 2 y Unravel Two, 100 % recomendados.',14,9,'2026-11-22 21:15:50'),(17,'Mario Kart 8 nunca falla.',14,5,'2026-11-22 21:25:50'),(18,'Y Kirby and the Forgotten Land tiene cooperativo.',14,13,'2026-11-22 21:35:50'),(19,'Steve siempre gana en mi casa.',15,14,'2026-11-15 22:15:50'),(20,'Coincido: prestar y revender solo se puede en físico.',16,12,'2026-11-22 12:15:50');
/*!40000 ALTER TABLE `comentarios_foro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','esquema inicial','SQL','V1__esquema_inicial.sql',-1788337725,'root','2026-11-23 04:15:50',235,1),(2,'2','datos prueba','SQL','V2__datos_prueba.sql',60492181,'root','2026-11-23 04:15:50',35,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `generos`
--

DROP TABLE IF EXISTS `generos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `generos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_generos_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `generos`
--

LOCK TABLES `generos` WRITE;
/*!40000 ALTER TABLE `generos` DISABLE KEYS */;
INSERT INTO `generos` VALUES (1,'Acción'),(2,'Aventura'),(5,'Carreras'),(6,'Deportes'),(9,'Estrategia'),(12,'Metroidvania'),(10,'Party'),(7,'Pelea'),(4,'Plataformas'),(3,'RPG'),(8,'Shooter'),(11,'Terror');
/*!40000 ALTER TABLE `generos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imagenes_videojuego`
--

DROP TABLE IF EXISTS `imagenes_videojuego`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagenes_videojuego` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int NOT NULL DEFAULT '0',
  `videojuego_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_imagenes_videojuego` (`videojuego_id`),
  CONSTRAINT `fk_imagenes_videojuego` FOREIGN KEY (`videojuego_id`) REFERENCES `videojuegos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagenes_videojuego`
--

LOCK TABLES `imagenes_videojuego` WRITE;
/*!40000 ALTER TABLE `imagenes_videojuego` DISABLE KEYS */;
/*!40000 ALTER TABLE `imagenes_videojuego` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mensaje` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enlace` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `usuario_id` bigint NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notificaciones_usuario` (`usuario_id`,`leida`),
  CONSTRAINT `fk_notificaciones_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,'Diego Ramírez recibió tu solicitud de préstamo de Zelda: Tears of the Kingdom.','/prestamos',0,4,'2026-11-22 17:15:50'),(2,'Marco Ríos quiere que le prestes Hades.','/prestamos',0,4,'2026-11-22 19:15:50'),(3,'Sofía Méndez aprobó tu préstamo de Metroid Prime Remastered.','/prestamos',0,4,'2026-11-21 22:15:50'),(4,'Tu devolución de Super Mario Odyssey vence en 3 días.','/prestamos',1,4,'2026-11-20 22:15:50'),(5,'Ana Torres quiere que le prestes Zelda: Tears of the Kingdom.','/prestamos',0,5,'2026-11-22 17:15:50'),(6,'Valeria Cruz te dejó una opinión de 5 estrellas.','/perfil/5',1,5,'2026-11-21 22:15:50'),(7,'Camila Ortiz quiere que le prestes Elden Ring.','/prestamos',0,10,'2026-11-21 22:15:50'),(8,'Fernanda Silva quiere comprar Marvel\'s Spider-Man 2.','/prestamos',0,12,'2026-11-22 16:15:50'),(9,'Andrés López aprobó tu préstamo de God of War Ragnarök.','/prestamos',0,10,'2026-11-21 22:15:50'),(10,'Paola Jiménez rechazó tu oferta por Super Mario 64.','/prestamos',1,14,'2026-11-14 22:15:50'),(11,'Bienvenido a Replay Club. Publica tu primer videojuego.','/publicar',1,13,'2026-08-24 22:15:50'),(12,'Hay 3 publicaciones nuevas en la comunidad.','/comunidad',0,2,'2026-11-22 20:15:50');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plataformas`
--

DROP TABLE IF EXISTS `plataformas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plataformas` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fabricante` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_plataformas_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plataformas`
--

LOCK TABLES `plataformas` WRITE;
/*!40000 ALTER TABLE `plataformas` DISABLE KEYS */;
INSERT INTO `plataformas` VALUES (1,'PlayStation 5','Sony'),(2,'PlayStation 4','Sony'),(3,'Xbox Series X','Microsoft'),(4,'Xbox One','Microsoft'),(5,'Nintendo Switch','Nintendo'),(6,'PC físico','Varios'),(7,'Nintendo 64','Nintendo'),(8,'Super Nintendo','Nintendo'),(9,'Game Boy Advance','Nintendo'),(10,'PlayStation 2','Sony');
/*!40000 ALTER TABLE `plataformas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicaciones_foro`
--

DROP TABLE IF EXISTS `publicaciones_foro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `publicaciones_foro` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `categoria` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `etiqueta` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calificacion` int DEFAULT NULL,
  `autor_id` bigint NOT NULL,
  `videojuego_id` bigint DEFAULT NULL,
  `usuario_valorado_id` bigint DEFAULT NULL,
  `solicitud_id` bigint DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_publicaciones_autor` (`autor_id`),
  KEY `fk_publicaciones_videojuego` (`videojuego_id`),
  KEY `fk_publicaciones_valorado` (`usuario_valorado_id`),
  KEY `fk_publicaciones_solicitud` (`solicitud_id`),
  KEY `idx_publicaciones_categoria` (`categoria`),
  CONSTRAINT `fk_publicaciones_autor` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_publicaciones_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_publicaciones_valorado` FOREIGN KEY (`usuario_valorado_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_publicaciones_videojuego` FOREIGN KEY (`videojuego_id`) REFERENCES `videojuegos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ck_publicaciones_calificacion` CHECK (((`calificacion` is null) or (`calificacion` between 1 and 5)))
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicaciones_foro`
--

LOCK TABLES `publicaciones_foro` WRITE;
/*!40000 ALTER TABLE `publicaciones_foro` DISABLE KEYS */;
INSERT INTO `publicaciones_foro` VALUES (1,'RESENA_VIDEOJUEGO','Tears of the Kingdom: Hyrule todavía tiene mucho que contar','Lo terminé después de 90 horas y sigo encontrando rincones nuevos. La exploración y las construcciones hacen que cada partida se sienta tuya. ¿Qué fue lo primero que construyeron?','Nintendo Switch',5,6,1,NULL,NULL,'2026-11-22 20:15:50'),(2,'OPINION_USUARIO','Una gran experiencia comprando a Diego','Compré Mario Kart 8 Deluxe a Diego Ramírez. La caja y el cartucho estaban tal como en las fotos, y llegó puntual al punto de entrega. Lo recomiendo para futuras transacciones.',NULL,5,9,NULL,5,7,'2026-11-21 22:15:50'),(3,'DISCUSION','¿Qué juego físico nunca venderían de su colección?','El mío es Pokémon Esmeralda: todavía conservo la caja desde 2005. Hay juegos que son más un recuerdo que un objeto. Quiero conocer esas joyas que guardan en su estante.','Coleccionismo físico',NULL,10,NULL,NULL,NULL,'2026-11-21 16:15:50'),(4,'RESENA_VIDEOJUEGO','Una secuela que sí sorprende','Las islas y las nuevas habilidades hacen que cada recorrido sea distinto. Lo disfruté muchísimo.','Nintendo Switch',5,10,1,NULL,NULL,'2026-11-19 22:15:50'),(5,'RESENA_VIDEOJUEGO','Hollow Knight es arte en movimiento','Difícil pero justo. La música y el mapa interconectado son de lo mejor del género metroidvania.','Nintendo Switch',5,4,7,NULL,NULL,'2026-11-18 22:15:50'),(6,'RESENA_VIDEOJUEGO','Ragnarök cierra la saga nórdica con fuerza','Combate más variado que el anterior y una historia muy emotiva entre Kratos y Atreus.','PlayStation',5,8,3,NULL,NULL,'2026-11-17 22:15:50'),(7,'RESENA_VIDEOJUEGO','Elden Ring: mi primer souls','Me costó trabajo al inicio, pero la libertad para explorar lo hace más accesible de lo que creía.','PlayStation',4,6,6,NULL,NULL,'2026-11-16 22:15:50'),(8,'OPINION_USUARIO','Diego, muy buena comunicación','Muy buena comunicación. Acordamos entrega y devolución sin problemas. Lo recomiendo.',NULL,5,8,NULL,5,8,'2026-10-03 22:15:50'),(9,'OPINION_USUARIO','Ana presta sus juegos impecables','Hades llegó con su caja y arte reversible tal cual. Ana fue muy amable.',NULL,5,8,NULL,4,5,'2026-10-11 22:15:50'),(10,'OPINION_USUARIO','Luis devolvió todo a tiempo','Me regresó el juego antes de la fecha y en perfecto estado.',NULL,4,4,NULL,8,5,'2026-10-11 22:15:50'),(11,'OPINION_USUARIO','Mateo, prestamista de confianza','Me prestó Elden Ring y hasta me dio tips para empezar. 10/10.',NULL,5,6,NULL,10,12,'2026-09-18 22:15:50'),(12,'OPINION_USUARIO','Buen trato con Andrés','Todo bien con el préstamo de Shadow of the Colossus; la entrega fue algo tarde, pero avisó con tiempo.',NULL,4,11,NULL,7,15,'2026-10-24 22:15:50'),(13,'DISCUSION','Cómo cuido las cajas de mi colección','Uso protectores de plástico y evito la luz directa del sol. ¿Ustedes qué hacen para que las cajas no se decoloren?','Coleccionismo físico',NULL,11,NULL,NULL,NULL,'2026-11-22 21:35:50'),(14,'DISCUSION','Recomendaciones para jugar en pareja','Busco juegos cooperativos locales para jugar con mi pareja. ¿Qué me recomiendan además de It Takes Two?','Recomendaciones',NULL,8,NULL,NULL,NULL,'2026-11-22 20:15:50'),(15,'RESENA_VIDEOJUEGO','Smash Ultimate nunca falla en una reunión','Todos los personajes, muchos escenarios y partidas rápidas. El party game definitivo.','Nintendo Switch',5,7,9,NULL,NULL,'2026-11-14 22:15:50'),(16,'DISCUSION','¿Vale la pena seguir comprando físico?','Con tantas tiendas digitales, ¿por qué siguen prefiriendo el formato físico? Yo por poder prestarlos aquí.','Recomendaciones',NULL,13,NULL,NULL,NULL,'2026-11-22 10:15:50');
/*!40000 ALTER TABLE `publicaciones_foro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Acceso total: gestión de usuarios y CRUD de todos los módulos'),(2,'MODERADOR','Modera publicaciones del catálogo y la comunidad'),(3,'JUGADOR','Renta, presta, vende y compra videojuegos físicos');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes`
--

DROP TABLE IF EXISTS `solicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `folio` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_devolucion` date DEFAULT NULL,
  `mensaje` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `respuesta` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `videojuego_id` bigint NOT NULL,
  `solicitante_id` bigint NOT NULL,
  `fecha_solicitud` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_solicitudes_videojuego` (`videojuego_id`),
  KEY `fk_solicitudes_solicitante` (`solicitante_id`),
  KEY `idx_solicitudes_estado` (`estado`),
  CONSTRAINT `fk_solicitudes_solicitante` FOREIGN KEY (`solicitante_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_solicitudes_videojuego` FOREIGN KEY (`videojuego_id`) REFERENCES `videojuegos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes`
--

LOCK TABLES `solicitudes` WRITE;
/*!40000 ALTER TABLE `solicitudes` DISABLE KEYS */;
INSERT INTO `solicitudes` VALUES (1,'P-0981','PRESTAMO','PENDIENTE','2026-11-24','2026-12-01','Hola Diego, me encantaría jugarlo una semana. Puedo recogerlo en Metro Coyoacán.',NULL,1,4,'2026-11-22 17:15:50','2026-11-22 22:15:50'),(2,'P-0982','PRESTAMO','PENDIENTE','2026-11-25','2026-12-02','¿Me lo prestas? Lo cuido como si fuera mío.',NULL,12,12,'2026-11-22 19:15:50','2026-11-22 22:15:50'),(3,'P-0983','PRESTAMO','APROBADO','2026-11-23','2026-11-30','Quiero terminar la saga Metroid.','Claro, nos vemos en Parque Hundido.',11,4,'2026-11-20 22:15:50','2026-11-22 22:15:50'),(4,'P-0984','PRESTAMO','EN_CURSO','2026-11-18','2026-11-25','Lo quiero para jugar con mi sobrino.','Listo, te lo entrego el lunes.',10,4,'2026-11-15 22:15:50','2026-11-22 22:15:50'),(5,'P-0975','PRESTAMO','FINALIZADO','2026-10-03','2026-10-10','¿Lo prestas una semana?','Sí, sin problema.',12,8,'2026-10-01 22:15:50','2026-11-22 22:15:50'),(6,'P-0976','PRESTAMO','RECHAZADO','2026-10-23','2026-10-30','Me interesa en préstamo.','Lo siento, esas fechas no puedo.',5,4,'2026-10-21 22:15:50','2026-11-22 22:15:50'),(7,'V-1042','COMPRA','FINALIZADO',NULL,NULL,'Me interesa comprarlo, ¿lo entregas en Coyoacán?','Hecho, nos vemos el sábado.',13,9,'2026-10-08 22:15:50','2026-11-22 22:15:50'),(8,'P-0970','PRESTAMO','FINALIZADO','2026-09-23','2026-09-30','Para una reunión con amigos.','Perfecto.',9,8,'2026-09-21 22:15:50','2026-11-22 22:15:50'),(9,'P-0985','PRESTAMO','PENDIENTE','2026-11-27','2026-12-11','Quiero intentarlo antes de comprarlo.',NULL,6,11,'2026-11-21 22:15:50','2026-11-22 22:15:50'),(10,'V-1050','COMPRA','PENDIENTE',NULL,NULL,'¿Sigue sellado? Lo compro.',NULL,14,13,'2026-11-22 16:15:50','2026-11-22 22:15:50'),(11,'P-0986','PRESTAMO','APROBADO','2026-11-24','2026-12-04','Me encantaría jugarlo.','Aprobado, te veo en Plaza Dorada.',3,10,'2026-11-21 22:15:50','2026-11-22 22:15:50'),(12,'P-0960','PRESTAMO','FINALIZADO','2026-09-03','2026-09-17','Primera vez con un souls.','Suerte, ¡lo vas a disfrutar!',6,6,'2026-09-01 22:15:50','2026-11-22 22:15:50'),(13,'V-1031','COMPRA','RECHAZADO',NULL,NULL,'¿Me lo dejas en 700?','Gracias, pero el precio es fijo.',20,14,'2026-11-13 22:15:50','2026-11-22 22:15:50'),(14,'P-0987','PRESTAMO','CANCELADO','2026-11-26','2026-12-02','Para probar el modo carrera.',NULL,15,15,'2026-11-18 22:15:50','2026-11-22 22:15:50'),(15,'P-0965','PRESTAMO','FINALIZADO','2026-10-13','2026-10-23','Es un clásico que nunca jugué.','Con gusto.',22,11,'2026-10-11 22:15:50','2026-11-22 22:15:50');
/*!40000 ALTER TABLE `solicitudes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens_recuperacion`
--

DROP TABLE IF EXISTS `tokens_recuperacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_recuperacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` bigint NOT NULL,
  `expiracion` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tokens_recuperacion` (`token`),
  KEY `fk_tokens_recuperacion_usuario` (`usuario_id`),
  CONSTRAINT `fk_tokens_recuperacion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_recuperacion`
--

LOCK TABLES `tokens_recuperacion` WRITE;
/*!40000 ALTER TABLE `tokens_recuperacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens_recuperacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens_revocados`
--

DROP TABLE IF EXISTS `tokens_revocados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_revocados` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `jti` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiracion` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tokens_revocados_jti` (`jti`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_revocados`
--

LOCK TABLES `tokens_revocados` WRITE;
/*!40000 ALTER TABLE `tokens_revocados` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens_revocados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `calificacion_promedio` decimal(3,2) NOT NULL DEFAULT '0.00',
  `total_opiniones` int NOT NULL DEFAULT '0',
  `transacciones_completadas` int NOT NULL DEFAULT '0',
  `rol_id` bigint NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_email` (`email`),
  KEY `fk_usuarios_rol` (`rol_id`),
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Administrador Replay','admin@replayclub.mx','$2a$10$FalO20t2YRKaHIp.J0j04u5v7TTLCebbkMjGAVKnS.s1SImH5aSt6','+525510000001','Ciudad de México','Cuenta de evaluación con acceso total al sistema.',NULL,1,0.00,0,0,1,'2024-01-02 09:00:00'),(2,'Laura Mendoza','moderador@replayclub.mx','$2a$10$7ZZwdOS0QUFxRwZ30iyfXeRrzJyo3yqq2/lvoj1Eo0a2l6z/t5UV2','+525510000002','Guadalajara, JAL','Moderadora de la comunidad. Fan de los RPG clásicos.',NULL,1,0.00,0,0,2,'2024-01-05 10:00:00'),(3,'Jorge Navarro','moderador2@replayclub.mx','$2a$10$7ZZwdOS0QUFxRwZ30iyfXeRrzJyo3yqq2/lvoj1Eo0a2l6z/t5UV2','+525510000003','Monterrey, NL','Reviso publicaciones para que todo sea legal y seguro.',NULL,1,0.00,0,0,2,'2024-02-11 11:30:00'),(4,'Ana Torres','ana.torres@correo.mx','$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa','+525510000004','Coyoacán, CDMX','Juego de todo un poco. Me encanta descubrir indies en formato físico.',NULL,1,5.00,1,1,3,'2024-03-14 18:20:00'),(5,'Diego Ramírez','diego.ramirez@correo.mx','$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa','+525510000005','Coyoacán, CDMX','Coleccionista de Nintendo y fan de las aventuras largas. Cuido mis juegos y disfruto que alguien más les dé una segunda partida.',NULL,1,5.00,2,2,3,'2024-01-20 12:00:00'),(6,'Sofía Méndez','sofia.mendez@correo.mx','$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa','+525510000006','Benito Juárez, CDMX','Exploradora de mundos abiertos y metroidvanias.',NULL,1,0.00,0,1,3,'2024-04-02 16:45:00'),(7,'Andrés López','andres.lopez@correo.mx','$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa','+525510000007','Puebla, PUE','PlayStation desde la PS2. Presto mis juegos con gusto.',NULL,1,4.00,1,1,3,'2024-02-28 09:10:00'),(8,'Luis Hernández','luis.hernandez@correo.mx','$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa','+525510000008','Tlalpan, CDMX','Jugador de Xbox y carreras. Siempre puntual en entregas.',NULL,1,4.00,1,2,3,'2024-05-09 20:00:00'),(9,'Valeria Cruz','valeria.cruz@correo.mx','$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa','+525510000009','Naucalpan, MEX','Survival horror y juegos cooperativos.',NULL,1,0.00,0,1,3,'2024-06-15 13:30:00'),(10,'Mateo García','mateo.garcia@correo.mx','$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa','+525510000010','Querétaro, QRO','Souls-like y retro portátil. Conservo cajas desde 2005.',NULL,1,5.00,1,1,3,'2024-03-03 08:00:00'),(11,'Camila Ortiz','camila.ortiz@correo.mx','$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa','+525510000011','Cuauhtémoc, CDMX','Coleccionismo físico y ediciones especiales.',NULL,1,0.00,0,1,3,'2024-07-21 17:15:00'),(12,'Marco Ríos','marco.rios@correo.mx','$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa','+525510000012','Zapopan, JAL','Estrategia en PC y acción en PS5.',NULL,1,0.00,0,0,3,'2024-08-01 10:40:00'),(13,'Fernanda Silva','fernanda.silva@correo.mx','$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa','+525510000013','Mérida, YUC','Juegos relajantes y party games con amigos.',NULL,1,0.00,0,0,3,'2024-08-19 19:00:00'),(14,'Ricardo Peña','ricardo.pena@correo.mx','$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa','+525510000014','León, GTO','Peleas y deportes. Busco rivales locales.',NULL,1,0.00,0,0,3,'2024-09-05 14:25:00'),(15,'Paola Jiménez','paola.jimenez@correo.mx','$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa','+525510000015','Toluca, MEX','Retro de Nintendo: cartuchos originales y probados.',NULL,1,0.00,0,0,3,'2024-10-10 12:00:00');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videojuego_generos`
--

DROP TABLE IF EXISTS `videojuego_generos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videojuego_generos` (
  `videojuego_id` bigint NOT NULL,
  `genero_id` bigint NOT NULL,
  PRIMARY KEY (`videojuego_id`,`genero_id`),
  KEY `fk_vg_genero` (`genero_id`),
  CONSTRAINT `fk_vg_genero` FOREIGN KEY (`genero_id`) REFERENCES `generos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vg_videojuego` FOREIGN KEY (`videojuego_id`) REFERENCES `videojuegos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videojuego_generos`
--

LOCK TABLES `videojuego_generos` WRITE;
/*!40000 ALTER TABLE `videojuego_generos` DISABLE KEYS */;
INSERT INTO `videojuego_generos` VALUES (1,1),(3,1),(5,1),(6,1),(11,1),(12,1),(14,1),(22,1),(1,2),(3,2),(8,2),(10,2),(14,2),(19,2),(22,2),(6,3),(8,3),(12,3),(19,3),(2,4),(7,4),(10,4),(20,4),(21,4),(13,5),(15,5),(17,6),(9,7),(18,7),(4,8),(24,8),(23,9),(9,10),(13,10),(16,10),(24,10),(5,11),(7,12),(11,12);
/*!40000 ALTER TABLE `videojuego_generos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videojuegos`
--

DROP TABLE IF EXISTS `videojuegos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videojuegos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `titulo` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(600) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anio_lanzamiento` int DEFAULT NULL,
  `estado_fisico` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modalidad` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio_venta` decimal(10,2) DEFAULT NULL,
  `dias_max_prestamo` int DEFAULT NULL,
  `condiciones_prestamo` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disponible_desde` date DEFAULT NULL,
  `ubicacion` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_publicacion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `calificacion_promedio` decimal(3,2) NOT NULL DEFAULT '0.00',
  `total_resenas` int NOT NULL DEFAULT '0',
  `plataforma_id` bigint NOT NULL,
  `propietario_id` bigint NOT NULL,
  `fecha_publicacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_videojuegos_plataforma` (`plataforma_id`),
  KEY `fk_videojuegos_propietario` (`propietario_id`),
  KEY `idx_videojuegos_estado` (`estado_publicacion`),
  KEY `idx_videojuegos_titulo` (`titulo`),
  CONSTRAINT `fk_videojuegos_plataforma` FOREIGN KEY (`plataforma_id`) REFERENCES `plataformas` (`id`),
  CONSTRAINT `fk_videojuegos_propietario` FOREIGN KEY (`propietario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videojuegos`
--

LOCK TABLES `videojuegos` WRITE;
/*!40000 ALTER TABLE `videojuegos` DISABLE KEYS */;
INSERT INTO `videojuegos` VALUES (1,'Zelda: Tears of the Kingdom','Explora los cielos y las profundidades de Hyrule. Edición física en español, probada y funcionando. Caja y cartucho originales, sin detalles.',2023,'COMO_NUEVO','AMBAS',950.00,7,'Entrega y devolución en Metro Coyoacán. Devolver caja y cartucho en el mismo estado.','2026-11-22','Coyoacán, CDMX','PUBLICADO',5.00,2,5,5,'2026-11-02 22:15:50','2026-11-22 22:15:50'),(2,'Super Mario Bros. Wonder','Edición física con caja original. Lo jugué una vez con mi hermano; está impecable.',2023,'COMO_NUEVO','VENTA',850.00,NULL,NULL,NULL,'Benito Juárez, CDMX','PUBLICADO',0.00,0,5,6,'2026-11-04 22:15:50','2026-11-22 22:15:50'),(3,'God of War Ragnarök','Disco sin rayones, caja con pequeño desgaste en una esquina. Incluye mapa impreso.',2022,'BUEN_ESTADO','AMBAS',690.00,10,'Entrega en Plaza Dorada, Puebla. Devolver con el mapa impreso.','2026-11-22','Puebla, PUE','PUBLICADO',5.00,1,1,7,'2026-11-06 22:15:50','2026-11-22 22:15:50'),(4,'Halo Infinite','Versión física para Xbox Series X. Disco funcionando al 100 %.',2021,'BUEN_ESTADO','VENTA',480.00,NULL,NULL,NULL,'Tlalpan, CDMX','PUBLICADO',0.00,0,3,8,'2026-11-07 22:15:50','2026-11-22 22:15:50'),(5,'Resident Evil 4','Remake en edición física. Caja y disco como nuevos. Ideal para terminarlo en un fin de semana largo.',2023,'COMO_NUEVO','AMBAS',750.00,7,'Entrega en Metro Cuatro Caminos. Devolver sin rayones.','2026-11-22','Naucalpan, MEX','PUBLICADO',0.00,0,1,9,'2026-11-22 21:15:50','2026-11-22 22:15:50'),(6,'Elden Ring','Solo lo presto: es de mi colección personal. Disco en buen estado y caja original.',2022,'BUEN_ESTADO','PRESTAMO',NULL,14,'Entrega en Querétaro centro. Devolver en la misma caja, sin stickers.','2026-11-22','Querétaro, QRO','PUBLICADO',4.00,1,1,10,'2026-11-08 22:15:50','2026-11-22 22:15:50'),(7,'Hollow Knight','Edición física nueva, aún sellada. Incluye manual a color.',2019,'NUEVO','VENTA',590.00,NULL,NULL,NULL,'Cuauhtémoc, CDMX','PUBLICADO',5.00,1,5,11,'2026-11-22 20:15:50','2026-11-22 22:15:50'),(8,'Leyendas Pokémon: Arceus','Cartucho original con caja. Lo terminé y quiero que alguien más lo disfrute.',2022,'BUEN_ESTADO','AMBAS',790.00,7,'Entrega en Metro Coyoacán. Devolver caja y cartucho.','2026-11-22','Coyoacán, CDMX','PUBLICADO',0.00,0,5,5,'2026-11-22 19:15:50','2026-11-22 22:15:50'),(9,'Super Smash Bros. Ultimate','Cartucho y caja originales. Perfecto para reuniones.',2018,'BUEN_ESTADO','AMBAS',850.00,7,'Entrega en Metro Coyoacán. Devolver con caja.','2026-11-22','Coyoacán, CDMX','PUBLICADO',5.00,1,5,5,'2026-10-23 22:15:50','2026-11-22 22:15:50'),(10,'Super Mario Odyssey','Cartucho en excelente estado con su caja original.',2017,'BUEN_ESTADO','AMBAS',700.00,7,'Entrega en Metro Coyoacán. Devolver en la fecha acordada.','2026-11-22','Coyoacán, CDMX','PRESTADO',0.00,0,5,5,'2026-10-13 22:15:50','2026-11-22 22:15:50'),(11,'Metroid Prime Remastered','Edición física como nueva. Solo préstamo para quien cuide sus juegos.',2023,'COMO_NUEVO','PRESTAMO',NULL,7,'Entrega en Parque Hundido. Devolver con caja.','2026-11-22','Benito Juárez, CDMX','PUBLICADO',0.00,0,5,6,'2026-11-10 22:15:50','2026-11-22 22:15:50'),(12,'Hades','Edición física con caja y arte reversible. Lo presto con gusto.',2020,'COMO_NUEVO','PRESTAMO',NULL,7,'Entrega en Metro Coyoacán. Devolver caja y cartucho en el mismo estado.','2026-11-22','Coyoacán, CDMX','PUBLICADO',0.00,0,5,4,'2026-10-28 22:15:50','2026-11-22 22:15:50'),(13,'Mario Kart 8 Deluxe','Cartucho y caja originales. Vendido a través de Replay Club.',2017,'BUEN_ESTADO','VENTA',600.00,NULL,NULL,NULL,'Coyoacán, CDMX','VENDIDO',0.00,0,5,5,'2026-09-23 22:15:50','2026-11-22 22:15:50'),(14,'Marvel\'s Spider-Man 2','Nuevo y sellado. Regalo repetido.',2023,'NUEVO','VENTA',1100.00,NULL,NULL,NULL,'Zapopan, JAL','PUBLICADO',0.00,0,1,12,'2026-11-17 22:15:50','2026-11-22 22:15:50'),(15,'Forza Horizon 5','Disco en buen estado. Ideal para probar antes de comprar.',2021,'BUEN_ESTADO','PRESTAMO',NULL,10,'Entrega en Metro Tasqueña. Devolver sin rayones.','2026-11-22','Tlalpan, CDMX','PUBLICADO',0.00,0,3,8,'2026-11-13 22:15:50','2026-11-22 22:15:50'),(16,'Animal Crossing: New Horizons','Cartucho con algo de uso en la caja. Funciona perfecto.',2020,'USADO','AMBAS',650.00,14,'Entrega en Paseo de Montejo. Devolver con caja.','2026-11-22','Mérida, YUC','PUBLICADO',0.00,0,5,13,'2026-11-14 22:15:50','2026-11-22 22:15:50'),(17,'EA Sports FC 24','Disco con caja. Algunos rayones superficiales, no afectan el juego.',2023,'USADO','VENTA',400.00,NULL,NULL,NULL,'León, GTO','PUBLICADO',0.00,0,2,14,'2026-11-15 22:15:50','2026-11-22 22:15:50'),(18,'Street Fighter 6','Como nuevo. Incluye código de vestuario ya usado.',2023,'COMO_NUEVO','AMBAS',800.00,7,'Entrega en Plaza Mayor León. Devolver con caja.','2026-11-22','León, GTO','PUBLICADO',0.00,0,1,14,'2026-11-16 22:15:50','2026-11-22 22:15:50'),(19,'Pokémon Esmeralda','Cartucho original probado; la pila guarda partida. Caja con desgaste.',2004,'USADO','PRESTAMO',NULL,5,'Solo préstamo en mano en Querétaro centro.','2026-11-22','Querétaro, QRO','PUBLICADO',0.00,0,9,10,'2026-11-11 22:15:50','2026-11-22 22:15:50'),(20,'Super Mario 64','Cartucho original de N64, contactos limpios. Sin caja.',1996,'USADO','VENTA',900.00,NULL,NULL,NULL,'Toluca, MEX','PUBLICADO',0.00,0,7,15,'2026-11-12 22:15:50','2026-11-22 22:15:50'),(21,'Donkey Kong Country','Cartucho original de Super Nintendo con caja reproducida.',1994,'BUEN_ESTADO','VENTA',750.00,NULL,NULL,NULL,'Toluca, MEX','PUBLICADO',0.00,0,8,15,'2026-11-18 22:15:50','2026-11-22 22:15:50'),(22,'Shadow of the Colossus','Edición original de PS2 con manual. Disco sin rayones.',2005,'BUEN_ESTADO','PRESTAMO',NULL,10,'Entrega en Plaza Dorada, Puebla.','2026-11-22','Puebla, PUE','PUBLICADO',0.00,0,10,7,'2026-10-18 22:15:50','2026-11-22 22:15:50'),(23,'Age of Empires II: Definitive Edition','Edición física para PC, nueva.',2019,'NUEVO','VENTA',450.00,NULL,NULL,NULL,'Zapopan, JAL','PUBLICADO',0.00,0,6,12,'2026-11-19 22:15:50','2026-11-22 22:15:50'),(24,'Splatoon 3','Borrador: falta tomar las fotos del cartucho.',2022,'COMO_NUEVO','AMBAS',780.00,7,'Entrega en Metro Coyoacán.','2026-11-22','Coyoacán, CDMX','BORRADOR',0.00,0,5,4,'2026-11-21 22:15:50','2026-11-22 22:15:50');
/*!40000 ALTER TABLE `videojuegos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
