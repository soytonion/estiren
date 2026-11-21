-- ============================================================================
-- SUCURSAL TORREÓN: 01_init.sql
-- Base de datos: estiren_torreon (Puerto Host 5434 / Red Docker 5432)
-- Dirección: Calle Falsa #123 Zona Centro, Torreón, Coah.
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
VALUES ('torreon', 'Sucursal Torreón', 'Calle Falsa #123 Zona Centro, Torreón, Coah.', '871-700-1122', TRUE)
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
    sucursal_codigo VARCHAR(20) DEFAULT 'torreon' REFERENCES sucursales(codigo),
    stock INT NOT NULL DEFAULT 0,
    pasillo VARCHAR(20) DEFAULT 'A1',
    estante VARCHAR(20) DEFAULT 'Nivel 2'
);

-- Stock físico local en Torreón
INSERT INTO inventario (producto_sku, stock, pasillo, estante) VALUES
('EST-4020', 14, 'Pasillo 1', 'Estante A'),
('CAB-VGA-HOSE', 0, 'Pasillo 3', 'Estante B'),
('BAT-9V-LEMON', 45, 'Pasillo 2', 'Estante C'),
('MUL-FE-900', 2, 'Pasillo 1', 'Estante D'),
('ARD-BLINK-13', 8, 'Pasillo 4', 'Estante A'),
('CAB-USB-PELADO', 0, 'Pasillo 3', 'Estante C'),
('PROT-HUMO-300', 5, 'Pasillo 1', 'Estante B'),
('LED-AZUL-CEGADOR', 120, 'Pasillo 4', 'Gaveta 12')
ON CONFLICT (producto_sku) DO UPDATE SET stock = EXCLUDED.stock;

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    rfc VARCHAR(20) UNIQUE DEFAULT 'XAXX010101000',
    telefono VARCHAR(50)
);

-- Eliminar posibles duplicados previos antes de asegurar el índice único
DELETE FROM clientes a USING clientes b WHERE a.id > b.id AND a.rfc = b.rfc;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_rfc ON clientes(rfc);

INSERT INTO clientes (nombre, email, rfc, telefono) VALUES
('Juan Pérez Lagunero', 'juan.perez@comarca.mx', 'PELJ850412XX1', '871-123-4567')
ON CONFLICT (rfc) DO UPDATE SET nombre = EXCLUDED.nombre, email = EXCLUDED.email, telefono = EXCLUDED.telefono;

CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cliente_id INT REFERENCES clientes(id),
    subtotal DECIMAL(10,2) NOT NULL,
    iva DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    sucursal_codigo VARCHAR(20) DEFAULT 'torreon' REFERENCES sucursales(codigo)
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INT REFERENCES ventas(id) ON DELETE CASCADE,
    producto_sku VARCHAR(50) REFERENCES productos(sku),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    importe DECIMAL(10,2) NOT NULL
);

-- Ventas iniciales en Torreón
INSERT INTO ventas (folio, cliente_id, subtotal, iva, total, sucursal_codigo) VALUES
('VTA-TRC-001', 1, 601.72, 96.28, 698.00, 'torreon'),
('VTA-TRC-002', 1, 1112.07, 177.93, 1290.00, 'torreon')
ON CONFLICT (folio) DO NOTHING;

INSERT INTO detalle_ventas (venta_id, producto_sku, cantidad, precio_unitario, importe)
SELECT v.id, 'EST-4020', 2, 349.00, 698.00 FROM ventas v WHERE v.folio = 'VTA-TRC-001'
AND NOT EXISTS (SELECT 1 FROM detalle_ventas dv WHERE dv.venta_id = v.id AND dv.producto_sku = 'EST-4020');

INSERT INTO detalle_ventas (venta_id, producto_sku, cantidad, precio_unitario, importe)
SELECT v.id, 'PROT-HUMO-300', 3, 430.00, 1290.00 FROM ventas v WHERE v.folio = 'VTA-TRC-002'
AND NOT EXISTS (SELECT 1 FROM detalle_ventas dv WHERE dv.venta_id = v.id AND dv.producto_sku = 'PROT-HUMO-300');

-- ============================================================================
-- 2. EXTENSIÓN POSTGRES_FDW Y CONFIGURACIÓN FEDERADA (INTER-SUCURSAL)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- A) Servidor foráneo hacia Villa Juárez
CREATE SERVER IF NOT EXISTS srv_juarez
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'db_juarez', port '5432', dbname 'estiren_juarez');

CREATE USER MAPPING IF NOT EXISTS FOR estiren_admin
SERVER srv_juarez
OPTIONS (user 'estiren_admin', password 'estiren_secret_password_2026');

CREATE FOREIGN TABLE IF NOT EXISTS ft_juarez_inventario (
    id INT,
    producto_sku VARCHAR(50),
    stock INT,
    pasillo VARCHAR(20),
    estante VARCHAR(20)
)
SERVER srv_juarez
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
-- 3. VISTA FEDERADA: STOCK MULTI-SUCURSAL DESDE TORREÓN
-- ============================================================================
CREATE OR REPLACE VIEW v_stock_multisucursal AS
SELECT 
    p.sku,
    p.nombre,
    'torreon' AS sucursal_codigo,
    'Sucursal Torreón' AS sucursal_nombre,
    'db_sucursal_torreon:5434' AS host_info,
    COALESCE(i.stock, 0) AS stock,
    TRUE AS es_local
FROM productos p
LEFT JOIN inventario i ON p.sku = i.producto_sku
UNION ALL
SELECT 
    p.sku,
    p.nombre,
    'juarez' AS sucursal_codigo,
    'Sucursal Villa Juárez' AS sucursal_nombre,
    'db_sucursal_juarez:5435' AS host_info,
    COALESCE(i.stock, 0) AS stock,
    FALSE AS es_local
FROM productos p
LEFT JOIN ft_juarez_inventario i ON p.sku = i.producto_sku
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
