-- =====================================================================
--  Replay Club - V2: datos de prueba (seed)
--  Contraseñas (hash BCrypt):
--    admin@replayclub.mx           -> Admin123!
--    moderador@replayclub.mx       -> Moder123!
--    moderador2@replayclub.mx      -> Moder123!
--    resto de jugadores            -> Jugador123!
-- =====================================================================

INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'ADMIN',     'Acceso total: gestión de usuarios y CRUD de todos los módulos'),
(2, 'MODERADOR', 'Modera publicaciones del catálogo y la comunidad'),
(3, 'JUGADOR',   'Renta, presta, vende y compra videojuegos físicos');

INSERT INTO usuarios (id, nombre, email, password, telefono, ciudad, bio, rol_id, fecha_registro) VALUES
(1,  'Administrador Replay', 'admin@replayclub.mx',       '$2a$10$FalO20t2YRKaHIp.J0j04u5v7TTLCebbkMjGAVKnS.s1SImH5aSt6', '+525510000001', 'Ciudad de México', 'Cuenta de evaluación con acceso total al sistema.', 1, '2024-01-02 09:00:00'),
(2,  'Laura Mendoza',        'moderador@replayclub.mx',   '$2a$10$7ZZwdOS0QUFxRwZ30iyfXeRrzJyo3yqq2/lvoj1Eo0a2l6z/t5UV2', '+525510000002', 'Guadalajara, JAL', 'Moderadora de la comunidad. Fan de los RPG clásicos.', 2, '2024-01-05 10:00:00'),
(3,  'Jorge Navarro',        'moderador2@replayclub.mx',  '$2a$10$7ZZwdOS0QUFxRwZ30iyfXeRrzJyo3yqq2/lvoj1Eo0a2l6z/t5UV2', '+525510000003', 'Monterrey, NL', 'Reviso publicaciones para que todo sea legal y seguro.', 2, '2024-02-11 11:30:00'),
(4,  'Ana Torres',           'ana.torres@correo.mx',      '$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa', '+525510000004', 'Coyoacán, CDMX', 'Juego de todo un poco. Me encanta descubrir indies en formato físico.', 3, '2024-03-14 18:20:00'),
(5,  'Diego Ramírez',        'diego.ramirez@correo.mx',   '$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa', '+525510000005', 'Coyoacán, CDMX', 'Coleccionista de Nintendo y fan de las aventuras largas. Cuido mis juegos y disfruto que alguien más les dé una segunda partida.', 3, '2024-01-20 12:00:00'),
(6,  'Sofía Méndez',         'sofia.mendez@correo.mx',    '$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa', '+525510000006', 'Benito Juárez, CDMX', 'Exploradora de mundos abiertos y metroidvanias.', 3, '2024-04-02 16:45:00'),
(7,  'Andrés López',         'andres.lopez@correo.mx',    '$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa', '+525510000007', 'Puebla, PUE', 'PlayStation desde la PS2. Presto mis juegos con gusto.', 3, '2024-02-28 09:10:00'),
(8,  'Luis Hernández',       'luis.hernandez@correo.mx',  '$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa', '+525510000008', 'Tlalpan, CDMX', 'Jugador de Xbox y carreras. Siempre puntual en entregas.', 3, '2024-05-09 20:00:00'),
(9,  'Valeria Cruz',         'valeria.cruz@correo.mx',    '$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa', '+525510000009', 'Naucalpan, MEX', 'Survival horror y juegos cooperativos.', 3, '2024-06-15 13:30:00'),
(10, 'Mateo García',         'mateo.garcia@correo.mx',    '$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa', '+525510000010', 'Querétaro, QRO', 'Souls-like y retro portátil. Conservo cajas desde 2005.', 3, '2024-03-03 08:00:00'),
(11, 'Camila Ortiz',         'camila.ortiz@correo.mx',    '$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa', '+525510000011', 'Cuauhtémoc, CDMX', 'Coleccionismo físico y ediciones especiales.', 3, '2024-07-21 17:15:00'),
(12, 'Marco Ríos',           'marco.rios@correo.mx',      '$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa', '+525510000012', 'Zapopan, JAL', 'Estrategia en PC y acción en PS5.', 3, '2024-08-01 10:40:00'),
(13, 'Fernanda Silva',       'fernanda.silva@correo.mx',  '$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa', '+525510000013', 'Mérida, YUC', 'Juegos relajantes y party games con amigos.', 3, '2024-08-19 19:00:00'),
(14, 'Ricardo Peña',         'ricardo.pena@correo.mx',    '$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa', '+525510000014', 'León, GTO', 'Peleas y deportes. Busco rivales locales.', 3, '2024-09-05 14:25:00'),
(15, 'Paola Jiménez',        'paola.jimenez@correo.mx',   '$2a$10$zl/hlU9jDqLn2APki//ixOE3BurvQTpPjEAJ8EQBhuNiRDZqPWxVa', '+525510000015', 'Toluca, MEX', 'Retro de Nintendo: cartuchos originales y probados.', 3, '2024-10-10 12:00:00');

INSERT INTO plataformas (id, nombre, fabricante) VALUES
(1,  'PlayStation 5',      'Sony'),
(2,  'PlayStation 4',      'Sony'),
(3,  'Xbox Series X',      'Microsoft'),
(4,  'Xbox One',           'Microsoft'),
(5,  'Nintendo Switch',    'Nintendo'),
(6,  'PC físico',          'Varios'),
(7,  'Nintendo 64',        'Nintendo'),
(8,  'Super Nintendo',     'Nintendo'),
(9,  'Game Boy Advance',   'Nintendo'),
(10, 'PlayStation 2',      'Sony');

INSERT INTO generos (id, nombre) VALUES
(1, 'Acción'), (2, 'Aventura'), (3, 'RPG'), (4, 'Plataformas'),
(5, 'Carreras'), (6, 'Deportes'), (7, 'Pelea'), (8, 'Shooter'),
(9, 'Estrategia'), (10, 'Party'), (11, 'Terror'), (12, 'Metroidvania');

INSERT INTO videojuegos (id, titulo, descripcion, anio_lanzamiento, estado_fisico, modalidad, precio_venta, dias_max_prestamo, condiciones_prestamo, disponible_desde, ubicacion, estado_publicacion, plataforma_id, propietario_id, fecha_publicacion) VALUES
(1,  'Zelda: Tears of the Kingdom', 'Explora los cielos y las profundidades de Hyrule. Edición física en español, probada y funcionando. Caja y cartucho originales, sin detalles.', 2023, 'COMO_NUEVO', 'AMBAS', 950.00, 7, 'Entrega y devolución en Metro Coyoacán. Devolver caja y cartucho en el mismo estado.', CURDATE(), 'Coyoacán, CDMX', 'PUBLICADO', 5, 5, NOW() - INTERVAL 20 DAY),
(2,  'Super Mario Bros. Wonder', 'Edición física con caja original. Lo jugué una vez con mi hermano; está impecable.', 2023, 'COMO_NUEVO', 'VENTA', 850.00, NULL, NULL, NULL, 'Benito Juárez, CDMX', 'PUBLICADO', 5, 6, NOW() - INTERVAL 18 DAY),
(3,  'God of War Ragnarök', 'Disco sin rayones, caja con pequeño desgaste en una esquina. Incluye mapa impreso.', 2022, 'BUEN_ESTADO', 'AMBAS', 690.00, 10, 'Entrega en Plaza Dorada, Puebla. Devolver con el mapa impreso.', CURDATE(), 'Puebla, PUE', 'PUBLICADO', 1, 7, NOW() - INTERVAL 16 DAY),
(4,  'Halo Infinite', 'Versión física para Xbox Series X. Disco funcionando al 100 %.', 2021, 'BUEN_ESTADO', 'VENTA', 480.00, NULL, NULL, NULL, 'Tlalpan, CDMX', 'PUBLICADO', 3, 8, NOW() - INTERVAL 15 DAY),
(5,  'Resident Evil 4', 'Remake en edición física. Caja y disco como nuevos. Ideal para terminarlo en un fin de semana largo.', 2023, 'COMO_NUEVO', 'AMBAS', 750.00, 7, 'Entrega en Metro Cuatro Caminos. Devolver sin rayones.', CURDATE(), 'Naucalpan, MEX', 'PUBLICADO', 1, 9, NOW() - INTERVAL 1 HOUR),
(6,  'Elden Ring', 'Solo lo presto: es de mi colección personal. Disco en buen estado y caja original.', 2022, 'BUEN_ESTADO', 'PRESTAMO', NULL, 14, 'Entrega en Querétaro centro. Devolver en la misma caja, sin stickers.', CURDATE(), 'Querétaro, QRO', 'PUBLICADO', 1, 10, NOW() - INTERVAL 14 DAY),
(7,  'Hollow Knight', 'Edición física nueva, aún sellada. Incluye manual a color.', 2019, 'NUEVO', 'VENTA', 590.00, NULL, NULL, NULL, 'Cuauhtémoc, CDMX', 'PUBLICADO', 5, 11, NOW() - INTERVAL 2 HOUR),
(8,  'Leyendas Pokémon: Arceus', 'Cartucho original con caja. Lo terminé y quiero que alguien más lo disfrute.', 2022, 'BUEN_ESTADO', 'AMBAS', 790.00, 7, 'Entrega en Metro Coyoacán. Devolver caja y cartucho.', CURDATE(), 'Coyoacán, CDMX', 'PUBLICADO', 5, 5, NOW() - INTERVAL 3 HOUR),
(9,  'Super Smash Bros. Ultimate', 'Cartucho y caja originales. Perfecto para reuniones.', 2018, 'BUEN_ESTADO', 'AMBAS', 850.00, 7, 'Entrega en Metro Coyoacán. Devolver con caja.', CURDATE(), 'Coyoacán, CDMX', 'PUBLICADO', 5, 5, NOW() - INTERVAL 30 DAY),
(10, 'Super Mario Odyssey', 'Cartucho en excelente estado con su caja original.', 2017, 'BUEN_ESTADO', 'AMBAS', 700.00, 7, 'Entrega en Metro Coyoacán. Devolver en la fecha acordada.', CURDATE(), 'Coyoacán, CDMX', 'PRESTADO', 5, 5, NOW() - INTERVAL 40 DAY),
(11, 'Metroid Prime Remastered', 'Edición física como nueva. Solo préstamo para quien cuide sus juegos.', 2023, 'COMO_NUEVO', 'PRESTAMO', NULL, 7, 'Entrega en Parque Hundido. Devolver con caja.', CURDATE(), 'Benito Juárez, CDMX', 'PUBLICADO', 5, 6, NOW() - INTERVAL 12 DAY),
(12, 'Hades', 'Edición física con caja y arte reversible. Lo presto con gusto.', 2020, 'COMO_NUEVO', 'PRESTAMO', NULL, 7, 'Entrega en Metro Coyoacán. Devolver caja y cartucho en el mismo estado.', CURDATE(), 'Coyoacán, CDMX', 'PUBLICADO', 5, 4, NOW() - INTERVAL 25 DAY),
(13, 'Mario Kart 8 Deluxe', 'Cartucho y caja originales. Vendido a través de Replay Club.', 2017, 'BUEN_ESTADO', 'VENTA', 600.00, NULL, NULL, NULL, 'Coyoacán, CDMX', 'VENDIDO', 5, 5, NOW() - INTERVAL 60 DAY),
(14, 'Marvel''s Spider-Man 2', 'Nuevo y sellado. Regalo repetido.', 2023, 'NUEVO', 'VENTA', 1100.00, NULL, NULL, NULL, 'Zapopan, JAL', 'PUBLICADO', 1, 12, NOW() - INTERVAL 5 DAY),
(15, 'Forza Horizon 5', 'Disco en buen estado. Ideal para probar antes de comprar.', 2021, 'BUEN_ESTADO', 'PRESTAMO', NULL, 10, 'Entrega en Metro Tasqueña. Devolver sin rayones.', CURDATE(), 'Tlalpan, CDMX', 'PUBLICADO', 3, 8, NOW() - INTERVAL 9 DAY),
(16, 'Animal Crossing: New Horizons', 'Cartucho con algo de uso en la caja. Funciona perfecto.', 2020, 'USADO', 'AMBAS', 650.00, 14, 'Entrega en Paseo de Montejo. Devolver con caja.', CURDATE(), 'Mérida, YUC', 'PUBLICADO', 5, 13, NOW() - INTERVAL 8 DAY),
(17, 'EA Sports FC 24', 'Disco con caja. Algunos rayones superficiales, no afectan el juego.', 2023, 'USADO', 'VENTA', 400.00, NULL, NULL, NULL, 'León, GTO', 'PUBLICADO', 2, 14, NOW() - INTERVAL 7 DAY),
(18, 'Street Fighter 6', 'Como nuevo. Incluye código de vestuario ya usado.', 2023, 'COMO_NUEVO', 'AMBAS', 800.00, 7, 'Entrega en Plaza Mayor León. Devolver con caja.', CURDATE(), 'León, GTO', 'PUBLICADO', 1, 14, NOW() - INTERVAL 6 DAY),
(19, 'Pokémon Esmeralda', 'Cartucho original probado; la pila guarda partida. Caja con desgaste.', 2004, 'USADO', 'PRESTAMO', NULL, 5, 'Solo préstamo en mano en Querétaro centro.', CURDATE(), 'Querétaro, QRO', 'PUBLICADO', 9, 10, NOW() - INTERVAL 11 DAY),
(20, 'Super Mario 64', 'Cartucho original de N64, contactos limpios. Sin caja.', 1996, 'USADO', 'VENTA', 900.00, NULL, NULL, NULL, 'Toluca, MEX', 'PUBLICADO', 7, 15, NOW() - INTERVAL 10 DAY),
(21, 'Donkey Kong Country', 'Cartucho original de Super Nintendo con caja reproducida.', 1994, 'BUEN_ESTADO', 'VENTA', 750.00, NULL, NULL, NULL, 'Toluca, MEX', 'PUBLICADO', 8, 15, NOW() - INTERVAL 4 DAY),
(22, 'Shadow of the Colossus', 'Edición original de PS2 con manual. Disco sin rayones.', 2005, 'BUEN_ESTADO', 'PRESTAMO', NULL, 10, 'Entrega en Plaza Dorada, Puebla.', CURDATE(), 'Puebla, PUE', 'PUBLICADO', 10, 7, NOW() - INTERVAL 35 DAY),
(23, 'Age of Empires II: Definitive Edition', 'Edición física para PC, nueva.', 2019, 'NUEVO', 'VENTA', 450.00, NULL, NULL, NULL, 'Zapopan, JAL', 'PUBLICADO', 6, 12, NOW() - INTERVAL 3 DAY),
(24, 'Splatoon 3', 'Borrador: falta tomar las fotos del cartucho.', 2022, 'COMO_NUEVO', 'AMBAS', 780.00, 7, 'Entrega en Metro Coyoacán.', CURDATE(), 'Coyoacán, CDMX', 'BORRADOR', 5, 4, NOW() - INTERVAL 1 DAY);

-- Relación N:M videojuegos - géneros
INSERT INTO videojuego_generos (videojuego_id, genero_id) VALUES
(1, 1), (1, 2), (2, 4), (3, 1), (3, 2), (4, 8), (5, 1), (5, 11),
(6, 1), (6, 3), (7, 4), (7, 12), (8, 2), (8, 3), (9, 7), (9, 10),
(10, 4), (10, 2), (11, 1), (11, 12), (12, 1), (12, 3), (13, 5), (13, 10),
(14, 1), (14, 2), (15, 5), (16, 10), (17, 6), (18, 7), (19, 3), (19, 2),
(20, 4), (21, 4), (22, 2), (22, 1), (23, 9), (24, 8), (24, 10);

-- Solicitudes de préstamo y compra en distintos estados
INSERT INTO solicitudes (id, folio, tipo, estado, fecha_inicio, fecha_devolucion, mensaje, respuesta, videojuego_id, solicitante_id, fecha_solicitud) VALUES
(1,  'P-0981', 'PRESTAMO', 'PENDIENTE',  CURDATE() + INTERVAL 2 DAY,  CURDATE() + INTERVAL 9 DAY,  'Hola Diego, me encantaría jugarlo una semana. Puedo recogerlo en Metro Coyoacán.', NULL, 1, 4, NOW() - INTERVAL 5 HOUR),
(2,  'P-0982', 'PRESTAMO', 'PENDIENTE',  CURDATE() + INTERVAL 3 DAY,  CURDATE() + INTERVAL 10 DAY, '¿Me lo prestas? Lo cuido como si fuera mío.', NULL, 12, 12, NOW() - INTERVAL 3 HOUR),
(3,  'P-0983', 'PRESTAMO', 'APROBADO',   CURDATE() + INTERVAL 1 DAY,  CURDATE() + INTERVAL 8 DAY,  'Quiero terminar la saga Metroid.', 'Claro, nos vemos en Parque Hundido.', 11, 4, NOW() - INTERVAL 2 DAY),
(4,  'P-0984', 'PRESTAMO', 'EN_CURSO',   CURDATE() - INTERVAL 4 DAY,  CURDATE() + INTERVAL 3 DAY,  'Lo quiero para jugar con mi sobrino.', 'Listo, te lo entrego el lunes.', 10, 4, NOW() - INTERVAL 7 DAY),
(5,  'P-0975', 'PRESTAMO', 'FINALIZADO', CURDATE() - INTERVAL 50 DAY, CURDATE() - INTERVAL 43 DAY, '¿Lo prestas una semana?', 'Sí, sin problema.', 12, 8, NOW() - INTERVAL 52 DAY),
(6,  'P-0976', 'PRESTAMO', 'RECHAZADO',  CURDATE() - INTERVAL 30 DAY, CURDATE() - INTERVAL 23 DAY, 'Me interesa en préstamo.', 'Lo siento, esas fechas no puedo.', 5, 4, NOW() - INTERVAL 32 DAY),
(7,  'V-1042', 'COMPRA',   'FINALIZADO', NULL, NULL, 'Me interesa comprarlo, ¿lo entregas en Coyoacán?', 'Hecho, nos vemos el sábado.', 13, 9, NOW() - INTERVAL 45 DAY),
(8,  'P-0970', 'PRESTAMO', 'FINALIZADO', CURDATE() - INTERVAL 60 DAY, CURDATE() - INTERVAL 53 DAY, 'Para una reunión con amigos.', 'Perfecto.', 9, 8, NOW() - INTERVAL 62 DAY),
(9,  'P-0985', 'PRESTAMO', 'PENDIENTE',  CURDATE() + INTERVAL 5 DAY,  CURDATE() + INTERVAL 19 DAY, 'Quiero intentarlo antes de comprarlo.', NULL, 6, 11, NOW() - INTERVAL 1 DAY),
(10, 'V-1050', 'COMPRA',   'PENDIENTE',  NULL, NULL, '¿Sigue sellado? Lo compro.', NULL, 14, 13, NOW() - INTERVAL 6 HOUR),
(11, 'P-0986', 'PRESTAMO', 'APROBADO',   CURDATE() + INTERVAL 2 DAY,  CURDATE() + INTERVAL 12 DAY, 'Me encantaría jugarlo.', 'Aprobado, te veo en Plaza Dorada.', 3, 10, NOW() - INTERVAL 1 DAY),
(12, 'P-0960', 'PRESTAMO', 'FINALIZADO', CURDATE() - INTERVAL 80 DAY, CURDATE() - INTERVAL 66 DAY, 'Primera vez con un souls.', 'Suerte, ¡lo vas a disfrutar!', 6, 6, NOW() - INTERVAL 82 DAY),
(13, 'V-1031', 'COMPRA',   'RECHAZADO',  NULL, NULL, '¿Me lo dejas en 700?', 'Gracias, pero el precio es fijo.', 20, 14, NOW() - INTERVAL 9 DAY),
(14, 'P-0987', 'PRESTAMO', 'CANCELADO',  CURDATE() + INTERVAL 4 DAY,  CURDATE() + INTERVAL 10 DAY, 'Para probar el modo carrera.', NULL, 15, 15, NOW() - INTERVAL 4 DAY),
(15, 'P-0965', 'PRESTAMO', 'FINALIZADO', CURDATE() - INTERVAL 40 DAY, CURDATE() - INTERVAL 30 DAY, 'Es un clásico que nunca jugué.', 'Con gusto.', 22, 11, NOW() - INTERVAL 42 DAY);

-- Foro de la comunidad
INSERT INTO publicaciones_foro (id, categoria, titulo, contenido, etiqueta, calificacion, autor_id, videojuego_id, usuario_valorado_id, solicitud_id, fecha_creacion) VALUES
(1,  'RESENA_VIDEOJUEGO', 'Tears of the Kingdom: Hyrule todavía tiene mucho que contar', 'Lo terminé después de 90 horas y sigo encontrando rincones nuevos. La exploración y las construcciones hacen que cada partida se sienta tuya. ¿Qué fue lo primero que construyeron?', 'Nintendo Switch', 5, 6, 1, NULL, NULL, NOW() - INTERVAL 2 HOUR),
(2,  'OPINION_USUARIO', 'Una gran experiencia comprando a Diego', 'Compré Mario Kart 8 Deluxe a Diego Ramírez. La caja y el cartucho estaban tal como en las fotos, y llegó puntual al punto de entrega. Lo recomiendo para futuras transacciones.', NULL, 5, 9, NULL, 5, 7, NOW() - INTERVAL 1 DAY),
(3,  'DISCUSION', '¿Qué juego físico nunca venderían de su colección?', 'El mío es Pokémon Esmeralda: todavía conservo la caja desde 2005. Hay juegos que son más un recuerdo que un objeto. Quiero conocer esas joyas que guardan en su estante.', 'Coleccionismo físico', NULL, 10, NULL, NULL, NULL, NOW() - INTERVAL 30 HOUR),
(4,  'RESENA_VIDEOJUEGO', 'Una secuela que sí sorprende', 'Las islas y las nuevas habilidades hacen que cada recorrido sea distinto. Lo disfruté muchísimo.', 'Nintendo Switch', 5, 10, 1, NULL, NULL, NOW() - INTERVAL 3 DAY),
(5,  'RESENA_VIDEOJUEGO', 'Hollow Knight es arte en movimiento', 'Difícil pero justo. La música y el mapa interconectado son de lo mejor del género metroidvania.', 'Nintendo Switch', 5, 4, 7, NULL, NULL, NOW() - INTERVAL 4 DAY),
(6,  'RESENA_VIDEOJUEGO', 'Ragnarök cierra la saga nórdica con fuerza', 'Combate más variado que el anterior y una historia muy emotiva entre Kratos y Atreus.', 'PlayStation', 5, 8, 3, NULL, NULL, NOW() - INTERVAL 5 DAY),
(7,  'RESENA_VIDEOJUEGO', 'Elden Ring: mi primer souls', 'Me costó trabajo al inicio, pero la libertad para explorar lo hace más accesible de lo que creía.', 'PlayStation', 4, 6, 6, NULL, NULL, NOW() - INTERVAL 6 DAY),
(8,  'OPINION_USUARIO', 'Diego, muy buena comunicación', 'Muy buena comunicación. Acordamos entrega y devolución sin problemas. Lo recomiendo.', NULL, 5, 8, NULL, 5, 8, NOW() - INTERVAL 50 DAY),
(9,  'OPINION_USUARIO', 'Ana presta sus juegos impecables', 'Hades llegó con su caja y arte reversible tal cual. Ana fue muy amable.', NULL, 5, 8, NULL, 4, 5, NOW() - INTERVAL 42 DAY),
(10, 'OPINION_USUARIO', 'Luis devolvió todo a tiempo', 'Me regresó el juego antes de la fecha y en perfecto estado.', NULL, 4, 4, NULL, 8, 5, NOW() - INTERVAL 42 DAY),
(11, 'OPINION_USUARIO', 'Mateo, prestamista de confianza', 'Me prestó Elden Ring y hasta me dio tips para empezar. 10/10.', NULL, 5, 6, NULL, 10, 12, NOW() - INTERVAL 65 DAY),
(12, 'OPINION_USUARIO', 'Buen trato con Andrés', 'Todo bien con el préstamo de Shadow of the Colossus; la entrega fue algo tarde, pero avisó con tiempo.', NULL, 4, 11, NULL, 7, 15, NOW() - INTERVAL 29 DAY),
(13, 'DISCUSION', 'Cómo cuido las cajas de mi colección', 'Uso protectores de plástico y evito la luz directa del sol. ¿Ustedes qué hacen para que las cajas no se decoloren?', 'Coleccionismo físico', NULL, 11, NULL, NULL, NULL, NOW() - INTERVAL 40 MINUTE),
(14, 'DISCUSION', 'Recomendaciones para jugar en pareja', 'Busco juegos cooperativos locales para jugar con mi pareja. ¿Qué me recomiendan además de It Takes Two?', 'Recomendaciones', NULL, 8, NULL, NULL, NULL, NOW() - INTERVAL 2 HOUR),
(15, 'RESENA_VIDEOJUEGO', 'Smash Ultimate nunca falla en una reunión', 'Todos los personajes, muchos escenarios y partidas rápidas. El party game definitivo.', 'Nintendo Switch', 5, 7, 9, NULL, NULL, NOW() - INTERVAL 8 DAY),
(16, 'DISCUSION', '¿Vale la pena seguir comprando físico?', 'Con tantas tiendas digitales, ¿por qué siguen prefiriendo el formato físico? Yo por poder prestarlos aquí.', 'Recomendaciones', NULL, 13, NULL, NULL, NULL, NOW() - INTERVAL 12 HOUR);

INSERT INTO comentarios_foro (contenido, publicacion_id, autor_id, fecha_creacion) VALUES
('¡Lo primero que construí fue un carrito con ventiladores!', 1, 4, NOW() - INTERVAL 90 MINUTE),
('Yo un puente para cruzar el cañón, jaja.', 1, 5, NOW() - INTERVAL 80 MINUTE),
('Totalmente de acuerdo, el mundo es enorme.', 1, 10, NOW() - INTERVAL 70 MINUTE),
('Diego siempre es puntual, confirmo.', 2, 8, NOW() - INTERVAL 20 HOUR),
('Gracias Valeria, fue un gusto.', 2, 5, NOW() - INTERVAL 19 HOUR),
('Chrono Trigger de SNES. Nunca lo vendería.', 3, 15, NOW() - INTERVAL 28 HOUR),
('Mi Pokémon Rojo con la caja original.', 3, 7, NOW() - INTERVAL 27 HOUR),
('Ocarina of Time, fue mi primer juego.', 3, 6, NOW() - INTERVAL 26 HOUR),
('Las islas del cielo son lo mejor.', 4, 4, NOW() - INTERVAL 2 DAY),
('La pelea contra Hornet me costó la vida, jaja.', 5, 11, NOW() - INTERVAL 3 DAY),
('El final me hizo llorar.', 6, 7, NOW() - INTERVAL 4 DAY),
('¿Qué build usaste al inicio?', 7, 10, NOW() - INTERVAL 5 DAY),
('Fuerza y espadón, sin pensarlo.', 7, 6, NOW() - INTERVAL 5 DAY),
('Gracias Luis, ¡vuelve cuando quieras!', 9, 4, NOW() - INTERVAL 41 DAY),
('Yo uso una vitrina cerrada, ayuda con el polvo.', 13, 15, NOW() - INTERVAL 30 MINUTE),
('Overcooked 2 y Unravel Two, 100 % recomendados.', 14, 9, NOW() - INTERVAL 1 HOUR),
('Mario Kart 8 nunca falla.', 14, 5, NOW() - INTERVAL 50 MINUTE),
('Y Kirby and the Forgotten Land tiene cooperativo.', 14, 13, NOW() - INTERVAL 40 MINUTE),
('Steve siempre gana en mi casa.', 15, 14, NOW() - INTERVAL 7 DAY),
('Coincido: prestar y revender solo se puede en físico.', 16, 12, NOW() - INTERVAL 10 HOUR);

INSERT INTO notificaciones (mensaje, enlace, leida, usuario_id, fecha_creacion) VALUES
('Diego Ramírez recibió tu solicitud de préstamo de Zelda: Tears of the Kingdom.', '/prestamos', FALSE, 4, NOW() - INTERVAL 5 HOUR),
('Marco Ríos quiere que le prestes Hades.', '/prestamos', FALSE, 4, NOW() - INTERVAL 3 HOUR),
('Sofía Méndez aprobó tu préstamo de Metroid Prime Remastered.', '/prestamos', FALSE, 4, NOW() - INTERVAL 1 DAY),
('Tu devolución de Super Mario Odyssey vence en 3 días.', '/prestamos', TRUE, 4, NOW() - INTERVAL 2 DAY),
('Ana Torres quiere que le prestes Zelda: Tears of the Kingdom.', '/prestamos', FALSE, 5, NOW() - INTERVAL 5 HOUR),
('Valeria Cruz te dejó una opinión de 5 estrellas.', '/perfil/5', TRUE, 5, NOW() - INTERVAL 1 DAY),
('Camila Ortiz quiere que le prestes Elden Ring.', '/prestamos', FALSE, 10, NOW() - INTERVAL 1 DAY),
('Fernanda Silva quiere comprar Marvel''s Spider-Man 2.', '/prestamos', FALSE, 12, NOW() - INTERVAL 6 HOUR),
('Andrés López aprobó tu préstamo de God of War Ragnarök.', '/prestamos', FALSE, 10, NOW() - INTERVAL 1 DAY),
('Paola Jiménez rechazó tu oferta por Super Mario 64.', '/prestamos', TRUE, 14, NOW() - INTERVAL 8 DAY),
('Bienvenido a Replay Club. Publica tu primer videojuego.', '/publicar', TRUE, 13, NOW() - INTERVAL 90 DAY),
('Hay 3 publicaciones nuevas en la comunidad.', '/comunidad', FALSE, 2, NOW() - INTERVAL 2 HOUR);

-- Calificaciones y transacciones calculadas a partir de los datos anteriores
UPDATE videojuegos v SET
    total_resenas = (SELECT COUNT(*) FROM publicaciones_foro p WHERE p.videojuego_id = v.id AND p.categoria = 'RESENA_VIDEOJUEGO'),
    calificacion_promedio = COALESCE((SELECT AVG(p.calificacion) FROM publicaciones_foro p WHERE p.videojuego_id = v.id AND p.categoria = 'RESENA_VIDEOJUEGO'), 0);

UPDATE usuarios u SET
    total_opiniones = (SELECT COUNT(*) FROM publicaciones_foro p WHERE p.usuario_valorado_id = u.id AND p.categoria = 'OPINION_USUARIO'),
    calificacion_promedio = COALESCE((SELECT AVG(p.calificacion) FROM publicaciones_foro p WHERE p.usuario_valorado_id = u.id AND p.categoria = 'OPINION_USUARIO'), 0),
    transacciones_completadas = (
        SELECT COUNT(*) FROM solicitudes s JOIN videojuegos v ON v.id = s.videojuego_id
        WHERE s.estado = 'FINALIZADO' AND (s.solicitante_id = u.id OR v.propietario_id = u.id));
