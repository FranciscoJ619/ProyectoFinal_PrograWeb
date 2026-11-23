-- =====================================================================
--  Replay Club - V1: esquema inicial
--  Motor: MySQL 8+ (InnoDB, utf8mb4)
-- =====================================================================

CREATE TABLE roles (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(30)  NOT NULL,
    descripcion VARCHAR(150) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_roles_nombre UNIQUE (nombre)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE usuarios (
    id                         BIGINT        NOT NULL AUTO_INCREMENT,
    nombre                     VARCHAR(100)  NOT NULL,
    email                      VARCHAR(150)  NOT NULL,
    password                   VARCHAR(100)  NOT NULL,
    telefono                   VARCHAR(20)   NULL,
    ciudad                     VARCHAR(100)  NULL,
    bio                        VARCHAR(500)  NULL,
    avatar_url                 VARCHAR(255)  NULL,
    activo                     BOOLEAN       NOT NULL DEFAULT TRUE,
    calificacion_promedio      DECIMAL(3, 2) NOT NULL DEFAULT 0,
    total_opiniones            INT           NOT NULL DEFAULT 0,
    transacciones_completadas  INT           NOT NULL DEFAULT 0,
    rol_id                     BIGINT        NOT NULL,
    fecha_registro             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_email UNIQUE (email),
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE plataformas (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    nombre     VARCHAR(60) NOT NULL,
    fabricante VARCHAR(60) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_plataformas_nombre UNIQUE (nombre)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE generos (
    id     BIGINT      NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(60) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_generos_nombre UNIQUE (nombre)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Cada registro es un ejemplar físico publicado por un usuario
CREATE TABLE videojuegos (
    id                    BIGINT         NOT NULL AUTO_INCREMENT,
    titulo                VARCHAR(120)   NOT NULL,
    descripcion           VARCHAR(600)   NOT NULL,
    anio_lanzamiento      INT            NULL,
    estado_fisico         VARCHAR(20)    NOT NULL, -- NUEVO, COMO_NUEVO, BUEN_ESTADO, USADO
    modalidad             VARCHAR(20)    NOT NULL, -- VENTA, PRESTAMO, AMBAS
    precio_venta          DECIMAL(10, 2) NULL,
    dias_max_prestamo     INT            NULL,
    condiciones_prestamo  VARCHAR(400)   NULL,
    disponible_desde      DATE           NULL,
    ubicacion             VARCHAR(120)   NOT NULL,
    estado_publicacion    VARCHAR(20)    NOT NULL, -- BORRADOR, PUBLICADO, PRESTADO, VENDIDO, INACTIVO
    calificacion_promedio DECIMAL(3, 2)  NOT NULL DEFAULT 0,
    total_resenas         INT            NOT NULL DEFAULT 0,
    plataforma_id         BIGINT         NOT NULL,
    propietario_id        BIGINT         NOT NULL,
    fecha_publicacion     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_videojuegos_plataforma FOREIGN KEY (plataforma_id) REFERENCES plataformas (id),
    CONSTRAINT fk_videojuegos_propietario FOREIGN KEY (propietario_id) REFERENCES usuarios (id),
    INDEX idx_videojuegos_estado (estado_publicacion),
    INDEX idx_videojuegos_titulo (titulo)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Relación N:M entre videojuegos y géneros
CREATE TABLE videojuego_generos (
    videojuego_id BIGINT NOT NULL,
    genero_id     BIGINT NOT NULL,
    PRIMARY KEY (videojuego_id, genero_id),
    CONSTRAINT fk_vg_videojuego FOREIGN KEY (videojuego_id) REFERENCES videojuegos (id) ON DELETE CASCADE,
    CONSTRAINT fk_vg_genero FOREIGN KEY (genero_id) REFERENCES generos (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE imagenes_videojuego (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    url           VARCHAR(255) NOT NULL,
    descripcion   VARCHAR(80)  NULL,
    orden         INT          NOT NULL DEFAULT 0,
    videojuego_id BIGINT       NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_imagenes_videojuego FOREIGN KEY (videojuego_id) REFERENCES videojuegos (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Solicitudes de préstamo (renta) o de compra de un ejemplar
CREATE TABLE solicitudes (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    folio               VARCHAR(12)  NULL,
    tipo                VARCHAR(20)  NOT NULL, -- PRESTAMO, COMPRA
    estado              VARCHAR(20)  NOT NULL, -- PENDIENTE, APROBADO, EN_CURSO, FINALIZADO, RECHAZADO, CANCELADO
    fecha_inicio        DATE         NULL,
    fecha_devolucion    DATE         NULL,
    mensaje             VARCHAR(400) NULL,
    respuesta           VARCHAR(400) NULL,
    videojuego_id       BIGINT       NOT NULL,
    solicitante_id      BIGINT       NOT NULL,
    fecha_solicitud     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_solicitudes_videojuego FOREIGN KEY (videojuego_id) REFERENCES videojuegos (id),
    CONSTRAINT fk_solicitudes_solicitante FOREIGN KEY (solicitante_id) REFERENCES usuarios (id),
    INDEX idx_solicitudes_estado (estado)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Foro de la comunidad: reseñas de videojuegos, opiniones sobre usuarios y discusiones
CREATE TABLE publicaciones_foro (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    categoria           VARCHAR(30)  NOT NULL, -- RESENA_VIDEOJUEGO, OPINION_USUARIO, DISCUSION
    titulo              VARCHAR(150) NOT NULL,
    contenido           TEXT         NOT NULL,
    etiqueta            VARCHAR(60)  NULL,
    calificacion        INT          NULL,
    autor_id            BIGINT       NOT NULL,
    videojuego_id       BIGINT       NULL,
    usuario_valorado_id BIGINT       NULL,
    solicitud_id        BIGINT       NULL,
    fecha_creacion      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_publicaciones_autor FOREIGN KEY (autor_id) REFERENCES usuarios (id),
    CONSTRAINT fk_publicaciones_videojuego FOREIGN KEY (videojuego_id) REFERENCES videojuegos (id) ON DELETE SET NULL,
    CONSTRAINT fk_publicaciones_valorado FOREIGN KEY (usuario_valorado_id) REFERENCES usuarios (id),
    CONSTRAINT fk_publicaciones_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitudes (id) ON DELETE SET NULL,
    CONSTRAINT ck_publicaciones_calificacion CHECK (calificacion IS NULL OR calificacion BETWEEN 1 AND 5),
    INDEX idx_publicaciones_categoria (categoria)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE comentarios_foro (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    contenido      VARCHAR(800) NOT NULL,
    publicacion_id BIGINT       NOT NULL,
    autor_id       BIGINT       NOT NULL,
    fecha_creacion DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_comentarios_publicacion FOREIGN KEY (publicacion_id) REFERENCES publicaciones_foro (id) ON DELETE CASCADE,
    CONSTRAINT fk_comentarios_autor FOREIGN KEY (autor_id) REFERENCES usuarios (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE notificaciones (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    mensaje        VARCHAR(255) NOT NULL,
    enlace         VARCHAR(150) NULL,
    leida          BOOLEAN      NOT NULL DEFAULT FALSE,
    usuario_id     BIGINT       NOT NULL,
    fecha_creacion DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    INDEX idx_notificaciones_usuario (usuario_id, leida)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Recuperación de contraseña
CREATE TABLE tokens_recuperacion (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    token      VARCHAR(80) NOT NULL,
    usuario_id BIGINT      NOT NULL,
    expiracion DATETIME    NOT NULL,
    usado      BOOLEAN     NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    CONSTRAINT uk_tokens_recuperacion UNIQUE (token),
    CONSTRAINT fk_tokens_recuperacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Lista negra de JWT invalidados al cerrar sesión
CREATE TABLE tokens_revocados (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    jti        VARCHAR(64) NOT NULL,
    expiracion DATETIME    NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_tokens_revocados_jti UNIQUE (jti)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
