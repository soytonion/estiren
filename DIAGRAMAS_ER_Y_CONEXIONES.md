## 📐 1. Diagrama Entidad-Relación: Base de Datos de Sucursal (`estiren_torreon`, `estiren_juarez`, `estiren_lerdo`)

Cada una de las 3 sucursales posee este esquema relacional completo (además de sus tablas foráneas `ft_*_inventario` hacia las otras dos sucursales):

```mermaid
erDiagram
    SUCURSALES ||--o{ INVENTARIO : "almacena en (sucursal_codigo)"
    SUCURSALES ||--o{ VENTAS : "emite en (sucursal_codigo)"
    CATEGORIAS ||--o{ PRODUCTOS : "clasifica (categoria_slug)"
    PRODUCTOS ||--|| INVENTARIO : "tiene stock (producto_sku)"
    CLIENTES ||--o{ VENTAS : "realiza (cliente_id)"
    VENTAS ||--|{ DETALLE_VENTAS : "contiene partidas (venta_id)"
    PRODUCTOS ||--o{ DETALLE_VENTAS : "se vende en (producto_sku)"

    SUCURSALES {
        varchar codigo PK "Ej: torreon, juarez, lerdo"
        varchar nombre
        text direccion
        varchar telefono
        boolean es_local
    }

    CATEGORIAS {
        serial id PK
        varchar slug UK "Clave única de categoría"
        varchar nombre
        text descripcion
    }

    PRODUCTOS {
        serial id PK
        varchar sku UK "Código único de artículo"
        varchar nombre
        varchar categoria_slug FK "Ref -> categorias(slug)"
        decimal precio
        decimal precio_original
        varchar emoji
        text descripcion
    }

    INVENTARIO {
        serial id PK
        varchar producto_sku FK "UK, Ref -> productos(sku)"
        varchar sucursal_codigo FK "Ref -> sucursales(codigo)"
        int stock
        varchar pasillo
        varchar estante
    }

    CLIENTES {
        serial id PK
        varchar nombre
        varchar email
        varchar rfc UK "Índice único por RFC"
        varchar telefono
    }

    VENTAS {
        serial id PK
        varchar folio UK "Ej: VTA-TOR-123456"
        timestamp fecha
        int cliente_id FK "Ref -> clientes(id)"
        decimal subtotal
        decimal iva
        decimal total
        varchar sucursal_codigo FK "Ref -> sucursales(codigo)"
    }

    DETALLE_VENTAS {
        serial id PK
        int venta_id FK "Ref -> ventas(id) ON DELETE CASCADE"
        varchar producto_sku FK "Ref -> productos(sku)"
        int cantidad
        decimal precio_unitario
        decimal importe
    }
```

---

## 🌐 3. Diagrama Entidad-Relación y Federación: Base de Datos CEDIS (`estiren_cedis`)

El nodo central del **CEDIS Gómez Palacio (`Puerto 5433`)** mantiene el catálogo maestro, la bitácora de traspasos entre tiendas y las tablas foráneas (`FOREIGN TABLE`) que conectan en vivo con las 3 sucursales:

```mermaid
erDiagram
    CATEGORIAS ||--o{ PRODUCTOS : "clasifica (categoria_slug)"
    PRODUCTOS ||--o{ TRASPASOS_ALMACEN : "se transfiere (producto_sku)"
    SUCURSALES ||--o{ TRASPASOS_ALMACEN : "envía (sucursal_origen)"
    SUCURSALES ||--o{ TRASPASOS_ALMACEN : "recibe (sucursal_destino)"

    PRODUCTOS ||--o| FT_TORREON_INVENTARIO : "FDW srv_torreon"
    PRODUCTOS ||--o| FT_JUAREZ_INVENTARIO : "FDW srv_juarez"
    PRODUCTOS ||--o| FT_LERDO_INVENTARIO : "FDW srv_lerdo"

    FT_TORREON_CLIENTES ||--o{ FT_TORREON_VENTAS : "FDW srv_torreon"
    FT_JUAREZ_CLIENTES ||--o{ FT_JUAREZ_VENTAS : "FDW srv_juarez"
    FT_LERDO_CLIENTES ||--o{ FT_LERDO_VENTAS : "FDW srv_lerdo"

    SUCURSALES {
        varchar codigo PK "cedis, torreon, juarez, lerdo"
        varchar nombre
        text direccion
        varchar telefono
        boolean es_hub
    }

    CATEGORIAS {
        serial id PK
        varchar slug UK
        varchar nombre
        text descripcion
    }

    PRODUCTOS {
        serial id PK
        varchar sku UK
        varchar nombre
        varchar categoria_slug FK
        decimal precio
        decimal precio_original
        varchar emoji
        text descripcion
    }

    TRASPASOS_ALMACEN {
        serial id PK
        varchar folio UK
        timestamp fecha
        varchar producto_sku FK "Ref -> productos(sku)"
        varchar sucursal_origen FK "Ref -> sucursales(codigo)"
        varchar sucursal_destino FK "Ref -> sucursales(codigo)"
        int cantidad
    }

    FT_TORREON_INVENTARIO {
        int id "FOREIGN TABLE (db_torreon)"
        varchar producto_sku
        int stock
    }

    FT_JUAREZ_INVENTARIO {
        int id "FOREIGN TABLE (db_juarez)"
        varchar producto_sku
        int stock
    }

    FT_LERDO_INVENTARIO {
        int id "FOREIGN TABLE (db_lerdo)"
        varchar producto_sku
        int stock
    }

    FT_TORREON_CLIENTES {
        int id "FOREIGN TABLE (db_torreon)"
        varchar nombre
        varchar rfc
    }

    FT_TORREON_VENTAS {
        int id "FOREIGN TABLE (db_torreon)"
        varchar folio
        int cliente_id
        decimal total
    }

    FT_JUAREZ_CLIENTES {
        int id "FOREIGN TABLE (db_juarez)"
        varchar nombre
        varchar rfc
    }

    FT_JUAREZ_VENTAS {
        int id "FOREIGN TABLE (db_juarez)"
        varchar folio
        int cliente_id
        decimal total
    }

    FT_LERDO_CLIENTES {
        int id "FOREIGN TABLE (db_lerdo)"
        varchar nombre
        varchar rfc
    }

    FT_LERDO_VENTAS {
        int id "FOREIGN TABLE (db_lerdo)"
        varchar folio
        int cliente_id
        decimal total
    }
```
