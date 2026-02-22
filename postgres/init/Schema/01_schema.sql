-- ============================================================
-- SCHEMA: Plataforma de Repuestos de Vehículos
-- ============================================================

-- Secuencia para numeración de facturas
CREATE SEQUENCE IF NOT EXISTS seq_factura START 1 INCREMENT 1;

-- ------------------------------------------------------------
-- Roles de usuario
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id     SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (nombre) VALUES ('ADMIN'), ('CLIENTE') ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Marcas de vehículos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marcas (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    pais_origen VARCHAR(100),
    activo      BOOLEAN   DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Modelos de vehículos (pertenecen a una marca)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modelos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    anio_inicio INTEGER,
    anio_fin    INTEGER,
    marca_id    INTEGER   NOT NULL REFERENCES marcas (id),
    activo      BOOLEAN   DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Categorías de repuestos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo      BOOLEAN DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Repuestos (producto principal)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repuestos (
    id           SERIAL PRIMARY KEY,
    codigo       VARCHAR(50)    UNIQUE NOT NULL,
    nombre       VARCHAR(200)   NOT NULL,
    descripcion  TEXT,
    precio       DECIMAL(10, 2) NOT NULL CHECK (precio > 0),
    stock        INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
    marca_id     INTEGER        NOT NULL REFERENCES marcas (id),
    modelo_id    INTEGER REFERENCES modelos (id),
    categoria_id INTEGER REFERENCES categorias (id),
    imagen_url   VARCHAR(500),
    activo       BOOLEAN   DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT NOW(),
    updated_at   TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Usuarios (clientes y administradores)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id         SERIAL PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    apellido   VARCHAR(100) NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    telefono   VARCHAR(20),
    direccion  TEXT,
    rol_id     INTEGER   NOT NULL REFERENCES roles (id) DEFAULT 2,
    activo     BOOLEAN   DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Facturas (cabecera)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS facturas (
    id               SERIAL PRIMARY KEY,
    numero_factura   VARCHAR(50) UNIQUE NOT NULL,
    usuario_id       INTEGER        NOT NULL REFERENCES usuarios (id),
    fecha            TIMESTAMP DEFAULT NOW(),
    subtotal         DECIMAL(10, 2) NOT NULL DEFAULT 0,
    iva              DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total            DECIMAL(10, 2) NOT NULL DEFAULT 0,
    estado           VARCHAR(20) DEFAULT 'PAGADA',
    direccion_envio  TEXT,
    observaciones    TEXT,
    created_at       TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Detalle de facturas (líneas de producto)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detalle_factura (
    id              SERIAL PRIMARY KEY,
    factura_id      INTEGER        NOT NULL REFERENCES facturas (id),
    repuesto_id     INTEGER        NOT NULL REFERENCES repuestos (id),
    cantidad        INTEGER        NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal        DECIMAL(10, 2) NOT NULL
);

-- ============================================================
-- TABLA: Tokens de recuperación de contraseña
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         SERIAL PRIMARY KEY,
    usuario_id INTEGER      NOT NULL REFERENCES usuarios(id),
    token      VARCHAR(255) UNIQUE NOT NULL,
    expira_en  TIMESTAMP    NOT NULL,
    usado      BOOLEAN      DEFAULT FALSE,
    created_at TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- TABLA: Favoritos (usuario ↔ repuesto, sin duplicados)
-- ============================================================
CREATE TABLE IF NOT EXISTS favoritos (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER   NOT NULL REFERENCES usuarios(id),
    repuesto_id INTEGER   NOT NULL REFERENCES repuestos(id),
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, repuesto_id)
);


-- ============================================================
-- DATOS INICIALES DE DEMOSTRACIÓN
-- ============================================================

-- Categorías
INSERT INTO categorias (nombre, descripcion)
VALUES ('Motor', 'Piezas internas y externas del motor'),
       ('Frenos', 'Pastillas, discos, bombas y sistemas de freno'),
       ('Suspensión', 'Amortiguadores, resortes, rótulas y brazos'),
       ('Eléctrico', 'Alternadores, baterías, luces y sensores'),
       ('Transmisión', 'Cajas de cambio, embragues y diferencial'),
       ('Carrocería', 'Puertas, capós, parabrisas y espejos'),
       ('Filtros', 'Filtros de aceite, aire, combustible y habitáculo'),
       ('Escape', 'Catalizadores, silenciadores y tubos')
ON CONFLICT DO NOTHING;

-- Marcas
INSERT INTO marcas (nombre, pais_origen)
VALUES ('Toyota', 'Japón'),
       ('Chevrolet', 'Estados Unidos'),
       ('Ford', 'Estados Unidos'),
       ('Hyundai', 'Corea del Sur'),
       ('Kia', 'Corea del Sur'),
       ('Volkswagen', 'Alemania'),
       ('Nissan', 'Japón'),
       ('Honda', 'Japón')
ON CONFLICT DO NOTHING;

-- Modelos Toyota
INSERT INTO modelos (nombre, anio_inicio, anio_fin, marca_id)
VALUES ('Corolla', 2000, 2024, 1),
       ('Hilux', 2005, 2024, 1),
       ('RAV4', 2010, 2024, 1),
       ('Yaris', 2006, 2024, 1);

-- Modelos Chevrolet
INSERT INTO modelos (nombre, anio_inicio, anio_fin, marca_id)
VALUES ('Aveo', 2003, 2020, 2),
       ('Sail', 2011, 2024, 2),
       ('Tracker', 2013, 2024, 2);

-- Modelos Ford
INSERT INTO modelos (nombre, anio_inicio, anio_fin, marca_id)
VALUES ('Ranger', 2006, 2024, 3),
       ('EcoSport', 2012, 2024, 3),
       ('Explorer', 2000, 2024, 3);

-- Modelos Hyundai
INSERT INTO modelos (nombre, anio_inicio, anio_fin, marca_id)
VALUES ('Tucson', 2004, 2024, 4),
       ('Accent', 2006, 2024, 4),
       ('Santa Fe', 2001, 2024, 4);

-- Repuestos de muestra
INSERT INTO repuestos (codigo, nombre, descripcion, precio, stock, marca_id, modelo_id, categoria_id)
VALUES ('TOY-COR-FP-001', 'Filtro de Aceite Toyota Corolla', 'Filtro de aceite original para Toyota Corolla 2000-2024', 12.50, 50, 1, 1, 7),
       ('TOY-HIL-PAS-001', 'Pastillas de Freno Hilux Delantera', 'Kit de pastillas delanteras para Toyota Hilux', 45.00, 30, 1, 2, 2),
       ('TOY-COR-AMO-001', 'Amortiguador Delantero Corolla', 'Amortiguador delantero original Toyota Corolla', 85.00, 20, 1, 1, 3),
       ('CHE-AVE-BAT-001', 'Batería Chevrolet Aveo 45AH', 'Batería 45AH compatible con Chevrolet Aveo', 95.00, 15, 2, 5, 4),
       ('FOR-RAN-DIS-001', 'Disco de Freno Ford Ranger', 'Par de discos de freno delanteros Ford Ranger', 120.00, 25, 3, 8, 2),
       ('HYU-TUC-FPA-001', 'Filtro de Aire Hyundai Tucson', 'Filtro de aire original Hyundai Tucson', 18.00, 40, 4, 11, 7),
       ('TOY-COR-BUJ-001', 'Bujías Toyota Corolla (x4)', 'Juego de 4 bujías NGK para Toyota Corolla', 32.00, 60, 1, 1, 1),
       ('CHE-SAI-EMB-001', 'Kit de Embrague Chevrolet Sail', 'Kit completo de embrague para Chevrolet Sail', 180.00, 10, 2, 6, 5);
