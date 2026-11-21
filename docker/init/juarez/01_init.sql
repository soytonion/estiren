-- ============================================================================
-- SUCURSAL VILLA JUÁREZ: 01_init.sql
-- Base de datos: estiren_juarez (Puerto Host 5435 / Red Docker 5432)
-- Dirección: Av. Collazo #1 Cd. Juárez, Dgo.
-- ============================================================================

-- 1. TABLAS LOCALES
CREATE TABLE IF NOT EXISTS sucursales (
    codigo VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(50),
    es_local BOOLEAN DEFAULT TRUE
);

INSERT INTO sucursales (codigo, nombre, direccion, telefono, es_local)
VALUES ('juarez', 'Sucursal Villa Juárez', 'Av. Collazo #1 Cd. Juárez, Dgo.', '871-700-3344', TRUE)
ON CONFLICT (codigo) DO NOTHING;

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

INSERT INTO categorias (slug, nombre, descripcion) VALUES
('herramientas', 'Herramientas y Soldadura', 'Cautines calientes, desarmadores y pinzas de punta chueca'),
('cables', 'Cables Imposibles', 'Adaptadores y cables para puertos extintos o ficticios'),
('energia', 'Energía y Pilas', 'Baterías ácidas, eliminadores de voltaje impredecible'),
('arduino', 'Módulos & Proyectos', 'Microcontroladores que parpadean una sola vez')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    categoria_slug VARCHAR(50) REFERENCES categorias(slug),
    precio DECIMAL(10,2) NOT NULL,
    precio_original DECIMAL(10,2) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    descripcion TEXT NOT NULL
);

INSERT INTO productos (sku, nombre, categoria_slug, precio, precio_original, emoji, descripcion) VALUES
('EST-4020', 'Cautín 60W con Mango Calefactable Involuntario', 'herramientas', 349.00, 499.00, '🔥', 'Diseñado para soldaduras rápidas antes de que el mango alcance la misma temperatura que la punta. Incluye soporte de lámina delgada.'),
('CAB-VGA-HOSE', 'Adaptador VGA Macho a Manguera de Jardín 1/2"', 'cables', 189.00, 220.00, '🚿', 'Transmite datos analógicos a 60 PSI de presión de agua. Ideal para regar el patio mientras proyectas diapositivas.'),
('BAT-9V-LEMON', 'Batería Cuadrada 9V Sabor Limón Ácido', 'energia', 75.00, 90.00, '🍋', 'Para quienes todavía prueban si la pila tiene carga poniéndosela en la lengua. Sabor cítrico mejorado libre de mercurio.'),
('MUL-FE-900', 'Multímetro para Medir la Fe de tus Circuitos', 'herramientas', 520.00, 650.00, '📟', 'Mide voltaje, amperaje y la probabilidad de que tu prototipo explote al conectarlo. Beep continuo cuando huele a quemado.'),
('ARD-BLINK-13', 'Arduino Uno que Solo Parpadea el Pin 13', 'arduino', 160.00, 210.00, '💡', 'Bootloader preprogramado para que nunca logres subir otro sketch que no sea el blink básico. Ahorra frustración.'),
('CAB-USB-PELADO', 'Cable USB-C a Contacto Bifásico Pelado', 'cables', 99.00, 150.00, '⚡', 'Carga ultrarrápida a 127 Volts directos. Recomendamos alejarse 3 metros al conectar a la pared.'),
('PROT-HUMO-300', 'Extractor de Humo Mágico de Circuitos', 'herramientas', 430.00, 580.00, '💨', 'Todos saben que los circuitos funcionan con humo mágico dentro. Si sale, ya no sirven. Este extractor no lo arregla, pero huele rico.'),
('LED-AZUL-CEGADOR', 'LED Azul Ultrabrillante Rompe-Retinas 10mm', 'arduino', 25.00, 35.00, '🔦', 'Ilumina toda tu recámara de noche cuando solo querías saber si la bocina estaba en Standby.')
ON CONFLICT (sku) DO NOTHING;

CREATE TABLE IF NOT EXISTS inventario (
    id SERIAL PRIMARY KEY,
    producto_sku VARCHAR(50) REFERENCES productos(sku) UNIQUE,
    sucursal_codigo VARCHAR(20) DEFAULT 'juarez' REFERENCES sucursales(codigo),
    stock INT NOT NULL DEFAULT 0,
    pasillo VARCHAR(20) DEFAULT 'A1',
    estante VARCHAR(20) DEFAULT 'Nivel 1'
);

-- Stock físico local en Villa Juárez
INSERT INTO inventario (producto_sku, stock, pasillo, estante) VALUES
('EST-4020', 3, 'Pasillo 1', 'Estante C'),
('CAB-VGA-HOSE', 12, 'Pasillo 2', 'Estante A'),
('BAT-9V-LEMON', 20, 'Pasillo 2', 'Estante D'),
('MUL-FE-900', 0, 'Pasillo 1', 'Estante B'),
('ARD-BLINK-13', 15, 'Pasillo 3', 'Estante A'),
('CAB-USB-PELADO', 4, 'Pasillo 4', 'Estante B'),
('PROT-HUMO-300', 2, 'Pasillo 1', 'Estante C'),
('LED-AZUL-CEGADOR', 85, 'Pasillo 3', 'Gaveta 04')
ON CONFLICT (producto_sku) DO UPDATE SET stock = EXCLUDED.stock;

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    rfc VARCHAR(20) UNIQUE DEFAULT 'XAXX010101000',
    telefono VARCHAR(50)
);

DELETE FROM clientes a USING clientes b WHERE a.id > b.id AND a.rfc = b.rfc;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_rfc ON clientes(rfc);

INSERT INTO clientes (nombre, email, rfc, telefono) VALUES
('Roberto Gómez Juárez', 'roberto.gomez@villa.mx', 'GOJR781105BB3', '871-332-9012')
ON CONFLICT (rfc) DO UPDATE SET nombre = EXCLUDED.nombre, email = EXCLUDED.email, telefono = EXCLUDED.telefono;

CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cliente_id INT REFERENCES clientes(id),
    subtotal DECIMAL(10,2) NOT NULL,
    iva DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    sucursal_codigo VARCHAR(20) DEFAULT 'juarez' REFERENCES sucursales(codigo)
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INT REFERENCES ventas(id) ON DELETE CASCADE,
    producto_sku VARCHAR(50) REFERENCES productos(sku),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    importe DECIMAL(10,2) NOT NULL
);

INSERT INTO ventas (folio, cliente_id, subtotal, iva, total, sucursal_codigo) VALUES
('VTA-JRA-001', 1, 325.86, 52.14, 378.00, 'juarez'),
('VTA-JRA-002', 1, 646.55, 103.45, 750.00, 'juarez')
ON CONFLICT (folio) DO NOTHING;

INSERT INTO detalle_ventas (venta_id, producto_sku, cantidad, precio_unitario, importe)
SELECT v.id, 'CAB-VGA-HOSE', 2, 189.00, 378.00 FROM ventas v WHERE v.folio = 'VTA-JRA-001'
AND NOT EXISTS (SELECT 1 FROM detalle_ventas dv WHERE dv.venta_id = v.id AND dv.producto_sku = 'CAB-VGA-HOSE');

INSERT INTO detalle_ventas (venta_id, producto_sku, cantidad, precio_unitario, importe)
SELECT v.id, 'BAT-9V-LEMON', 10, 75.00, 750.00 FROM ventas v WHERE v.folio = 'VTA-JRA-002'
AND NOT EXISTS (SELECT 1 FROM detalle_ventas dv WHERE dv.venta_id = v.id AND dv.producto_sku = 'BAT-9V-LEMON');

-- ============================================================================
-- 2. EXTENSIÓN POSTGRES_FDW Y CONFIGURACIÓN FEDERADA (INTER-SUCURSAL)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- A) Servidor foráneo hacia Torreón
CREATE SERVER IF NOT EXISTS srv_torreon
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'db_torreon', port '5432', dbname 'estiren_torreon');

CREATE USER MAPPING IF NOT EXISTS FOR estiren_admin
SERVER srv_torreon
OPTIONS (user 'estiren_admin', password 'estiren_secret_password_2026');

CREATE FOREIGN TABLE IF NOT EXISTS ft_torreon_inventario (
    id INT,
    producto_sku VARCHAR(50),
    stock INT,
    pasillo VARCHAR(20),
    estante VARCHAR(20)
)
SERVER srv_torreon
OPTIONS (table_name 'inventario');

-- B) Servidor foráneo hacia Lerdo
CREATE SERVER IF NOT EXISTS srv_lerdo
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'db_lerdo', port '5432', dbname 'estiren_lerdo');

CREATE USER MAPPING IF NOT EXISTS FOR estiren_admin
SERVER srv_lerdo
OPTIONS (user 'estiren_admin', password 'estiren_secret_password_2026');

CREATE FOREIGN TABLE IF NOT EXISTS ft_lerdo_inventario (
    id INT,
    producto_sku VARCHAR(50),
    stock INT,
    pasillo VARCHAR(20),
    estante VARCHAR(20)
)
SERVER srv_lerdo
OPTIONS (table_name 'inventario');

-- ============================================================================
-- 3. VISTA FEDERADA: STOCK MULTI-SUCURSAL DESDE VILLA JUÁREZ
-- ============================================================================
CREATE OR REPLACE VIEW v_stock_multisucursal AS
SELECT 
    p.sku,
    p.nombre,
    'juarez' AS sucursal_codigo,
    'Sucursal Villa Juárez' AS sucursal_nombre,
    'db_sucursal_juarez:5435' AS host_info,
    COALESCE(i.stock, 0) AS stock,
    TRUE AS es_local
FROM productos p
LEFT JOIN inventario i ON p.sku = i.producto_sku
UNION ALL
SELECT 
    p.sku,
    p.nombre,
    'torreon' AS sucursal_codigo,
    'Sucursal Torreón' AS sucursal_nombre,
    'db_sucursal_torreon:5434' AS host_info,
    COALESCE(i.stock, 0) AS stock,
    FALSE AS es_local
FROM productos p
LEFT JOIN ft_torreon_inventario i ON p.sku = i.producto_sku
UNION ALL
SELECT 
    p.sku,
    p.nombre,
    'lerdo' AS sucursal_codigo,
    'Sucursal Lerdo' AS sucursal_nombre,
    'db_sucursal_lerdo:5436' AS host_info,
    COALESCE(i.stock, 0) AS stock,
    FALSE AS es_local
FROM productos p
LEFT JOIN ft_lerdo_inventario i ON p.sku = i.producto_sku;
