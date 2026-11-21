-- ============================================================================
-- CEDIS GÓMEZ PALACIO: 01_init.sql
-- Base de datos: estiren_cedis (Puerto Host 5433 / Red Docker 5432)
-- Ubicación: Gómez Palacio, Dgo. (Hub Central Federado)
-- ============================================================================

-- 1. CATÁLOGO MAESTRO CENTRAL Y SUCURSALES
CREATE TABLE IF NOT EXISTS sucursales (
    codigo VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(50),
    es_hub BOOLEAN DEFAULT FALSE
);

INSERT INTO sucursales (codigo, nombre, direccion, telefono, es_hub) VALUES
('cedis', 'CEDIS Gómez Palacio', 'En algún lugar de Gómez Palacio, Dgo.', '871-700-0000', TRUE),
('torreon', 'Sucursal Torreón', 'Calle Falsa #123 Zona Centro, Torreón, Coah.', '871-700-1122', FALSE),
('juarez', 'Sucursal Villa Juárez', 'Av. Collazo #1 Cd. Juárez, Dgo.', '871-700-3344', FALSE),
('lerdo', 'Sucursal Lerdo', 'Av. 6 de Abril #1818 Pte. Lerdo, Dgo.', '871-700-5566', FALSE)
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

CREATE TABLE IF NOT EXISTS traspasos_almacen (
    id SERIAL PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    producto_sku VARCHAR(50) REFERENCES productos(sku),
    sucursal_origen VARCHAR(20) REFERENCES sucursales(codigo),
    sucursal_destino VARCHAR(20) REFERENCES sucursales(codigo),
    cantidad INT NOT NULL
);

-- ============================================================================
-- 2. EXTENSIÓN POSTGRES_FDW Y CONFIGURACIÓN CENTRAL DE NODOS
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

CREATE FOREIGN TABLE IF NOT EXISTS ft_torreon_clientes (
    id INT,
    nombre VARCHAR(150),
    email VARCHAR(150),
    rfc VARCHAR(20),
    telefono VARCHAR(50)
)
SERVER srv_torreon
OPTIONS (table_name 'clientes');

CREATE FOREIGN TABLE IF NOT EXISTS ft_torreon_ventas (
    id INT,
    folio VARCHAR(50),
    fecha TIMESTAMP,
    cliente_id INT,
    subtotal DECIMAL(10,2),
    iva DECIMAL(10,2),
    total DECIMAL(10,2),
    sucursal_codigo VARCHAR(20)
)
SERVER srv_torreon
OPTIONS (table_name 'ventas');

CREATE FOREIGN TABLE IF NOT EXISTS ft_torreon_detalle_ventas (
    id INT,
    venta_id INT,
    producto_sku VARCHAR(50),
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    importe DECIMAL(10,2)
)
SERVER srv_torreon
OPTIONS (table_name 'detalle_ventas');

-- B) Servidor foráneo hacia Villa Juárez
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

CREATE FOREIGN TABLE IF NOT EXISTS ft_juarez_clientes (
    id INT,
    nombre VARCHAR(150),
    email VARCHAR(150),
    rfc VARCHAR(20),
    telefono VARCHAR(50)
)
SERVER srv_juarez
OPTIONS (table_name 'clientes');

CREATE FOREIGN TABLE IF NOT EXISTS ft_juarez_ventas (
    id INT,
    folio VARCHAR(50),
    fecha TIMESTAMP,
    cliente_id INT,
    subtotal DECIMAL(10,2),
    iva DECIMAL(10,2),
    total DECIMAL(10,2),
    sucursal_codigo VARCHAR(20)
)
SERVER srv_juarez
OPTIONS (table_name 'ventas');

CREATE FOREIGN TABLE IF NOT EXISTS ft_juarez_detalle_ventas (
    id INT,
    venta_id INT,
    producto_sku VARCHAR(50),
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    importe DECIMAL(10,2)
)
SERVER srv_juarez
OPTIONS (table_name 'detalle_ventas');

-- C) Servidor foráneo hacia Lerdo
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

CREATE FOREIGN TABLE IF NOT EXISTS ft_lerdo_clientes (
    id INT,
    nombre VARCHAR(150),
    email VARCHAR(150),
    rfc VARCHAR(20),
    telefono VARCHAR(50)
)
SERVER srv_lerdo
OPTIONS (table_name 'clientes');

CREATE FOREIGN TABLE IF NOT EXISTS ft_lerdo_ventas (
    id INT,
    folio VARCHAR(50),
    fecha TIMESTAMP,
    cliente_id INT,
    subtotal DECIMAL(10,2),
    iva DECIMAL(10,2),
    total DECIMAL(10,2),
    sucursal_codigo VARCHAR(20)
)
SERVER srv_lerdo
OPTIONS (table_name 'ventas');

CREATE FOREIGN TABLE IF NOT EXISTS ft_lerdo_detalle_ventas (
    id INT,
    venta_id INT,
    producto_sku VARCHAR(50),
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    importe DECIMAL(10,2)
)
SERVER srv_lerdo
OPTIONS (table_name 'detalle_ventas');

-- ============================================================================
-- 3. VISTAS MAESTRAS CONSOLIDADAS EN CEDIS GÓMEZ PALACIO
-- ============================================================================

-- Vista A: Matriz de existencias global cruzada
CREATE OR REPLACE VIEW v_stock_global AS
SELECT 
    p.sku,
    p.nombre,
    p.categoria_slug,
    p.precio,
    p.emoji,
    COALESCE(it.stock, 0) AS stock_torreon,
    COALESCE(ij.stock, 0) AS stock_juarez,
    COALESCE(il.stock, 0) AS stock_lerdo,
    (COALESCE(it.stock, 0) + COALESCE(ij.stock, 0) + COALESCE(il.stock, 0)) AS stock_total_red
FROM productos p
LEFT JOIN ft_torreon_inventario it ON p.sku = it.producto_sku
LEFT JOIN ft_juarez_inventario ij ON p.sku = ij.producto_sku
LEFT JOIN ft_lerdo_inventario il ON p.sku = il.producto_sku;

-- Vista B: Todas las ventas combinadas de la red con datos de cliente y detalle de artículos
CREATE OR REPLACE VIEW v_ventas_todas AS
SELECT 
    'torreon' AS sucursal_codigo, 
    'Sucursal Torreón' AS sucursal_nombre, 
    '5434' AS puerto, 
    v.id, 
    v.folio, 
    v.fecha, 
    COALESCE(c.nombre, 'Cliente Mostrador') AS cliente_nombre,
    COALESCE(c.rfc, 'XAXX010101000') AS cliente_rfc,
    v.subtotal, 
    v.iva, 
    v.total,
    COALESCE((SELECT SUM(dv.cantidad) FROM ft_torreon_detalle_ventas dv WHERE dv.venta_id = v.id), 1) AS unidades,
    COALESCE(
      (SELECT STRING_AGG(dv.cantidad || 'x ' || p.nombre, ', ')
       FROM ft_torreon_detalle_ventas dv
       JOIN productos p ON p.sku = dv.producto_sku
       WHERE dv.venta_id = v.id),
      'Artículos varios'
    ) AS articulos_detalle
FROM ft_torreon_ventas v
LEFT JOIN ft_torreon_clientes c ON v.cliente_id = c.id
UNION ALL
SELECT 
    'juarez' AS sucursal_codigo, 
    'Sucursal Villa Juárez' AS sucursal_nombre, 
    '5435' AS puerto, 
    v.id, 
    v.folio, 
    v.fecha, 
    COALESCE(c.nombre, 'Cliente Mostrador') AS cliente_nombre,
    COALESCE(c.rfc, 'XAXX010101000') AS cliente_rfc,
    v.subtotal, 
    v.iva, 
    v.total,
    COALESCE((SELECT SUM(dv.cantidad) FROM ft_juarez_detalle_ventas dv WHERE dv.venta_id = v.id), 1) AS unidades,
    COALESCE(
      (SELECT STRING_AGG(dv.cantidad || 'x ' || p.nombre, ', ')
       FROM ft_juarez_detalle_ventas dv
       JOIN productos p ON p.sku = dv.producto_sku
       WHERE dv.venta_id = v.id),
      'Artículos varios'
    ) AS articulos_detalle
FROM ft_juarez_ventas v
LEFT JOIN ft_juarez_clientes c ON v.cliente_id = c.id
UNION ALL
SELECT 
    'lerdo' AS sucursal_codigo, 
    'Sucursal Lerdo' AS sucursal_nombre, 
    '5436' AS puerto, 
    v.id, 
    v.folio, 
    v.fecha, 
    COALESCE(c.nombre, 'Cliente Mostrador') AS cliente_nombre,
    COALESCE(c.rfc, 'XAXX010101000') AS cliente_rfc,
    v.subtotal, 
    v.iva, 
    v.total,
    COALESCE((SELECT SUM(dv.cantidad) FROM ft_lerdo_detalle_ventas dv WHERE dv.venta_id = v.id), 1) AS unidades,
    COALESCE(
      (SELECT STRING_AGG(dv.cantidad || 'x ' || p.nombre, ', ')
       FROM ft_lerdo_detalle_ventas dv
       JOIN productos p ON p.sku = dv.producto_sku
       WHERE dv.venta_id = v.id),
      'Artículos varios'
    ) AS articulos_detalle
FROM ft_lerdo_ventas v
LEFT JOIN ft_lerdo_clientes c ON v.cliente_id = c.id;

-- Vista C: Consolidado analítico por sucursal para el Dashboard
CREATE OR REPLACE VIEW v_ventas_consolidadas AS
SELECT 
    sucursal_codigo,
    sucursal_nombre,
    puerto,
    COUNT(folio) AS tickets_emitidos,
    COALESCE(SUM(unidades), 0) AS unidades_vendidas,
    COALESCE(SUM(total), 0) AS total_ventas
FROM v_ventas_todas
GROUP BY sucursal_codigo, sucursal_nombre, puerto;

-- Vista D: Directorio Federado de Clientes de todas las sucursales
CREATE OR REPLACE VIEW v_clientes_federados AS
SELECT 
    'torreon' AS sucursal_codigo,
    'Sucursal Torreón' AS sucursal_nombre,
    c.id AS cliente_id,
    c.nombre,
    c.email,
    c.rfc,
    c.telefono,
    COUNT(v.id) AS total_compras,
    COALESCE(SUM(v.total), 0) AS monto_acumulado
FROM ft_torreon_clientes c
LEFT JOIN ft_torreon_ventas v ON c.id = v.cliente_id
GROUP BY c.id, c.nombre, c.email, c.rfc, c.telefono
UNION ALL
SELECT 
    'juarez' AS sucursal_codigo,
    'Sucursal Villa Juárez' AS sucursal_nombre,
    c.id AS cliente_id,
    c.nombre,
    c.email,
    c.rfc,
    c.telefono,
    COUNT(v.id) AS total_compras,
    COALESCE(SUM(v.total), 0) AS monto_acumulado
FROM ft_juarez_clientes c
LEFT JOIN ft_juarez_ventas v ON c.id = v.cliente_id
GROUP BY c.id, c.nombre, c.email, c.rfc, c.telefono
UNION ALL
SELECT 
    'lerdo' AS sucursal_codigo,
    'Sucursal Lerdo' AS sucursal_nombre,
    c.id AS cliente_id,
    c.nombre,
    c.email,
    c.rfc,
    c.telefono,
    COUNT(v.id) AS total_compras,
    COALESCE(SUM(v.total), 0) AS monto_acumulado
FROM ft_lerdo_clientes c
LEFT JOIN ft_lerdo_ventas v ON c.id = v.cliente_id
GROUP BY c.id, c.nombre, c.email, c.rfc, c.telefono;
