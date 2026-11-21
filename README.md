# Estiren — E-Commerce y Sistema de Operaciones Multi-Sucursal

Aplicación web desarrollada con **Next.js 15**, **TypeScript**, **Tailwind CSS** y **4 bases de datos PostgreSQL 16** en Docker conectadas mediante **Tablas Federadas (`postgres_fdw`)**.

---

## Cómo levantar el proyecto desde cero

1. **Iniciar los 4 contenedores de PostgreSQL en Docker:**
   ```bash
   docker compose up -d
   ```

2. **Instalar dependencias de Node.js:**
   ```bash
   npm install
   ```

3. **Sincronizar esquemas, llaves foráneas y vistas federadas:**
   ```bash
   npm run db:sync
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre **[http://localhost:3000](http://localhost:3000)** en tu navegador.

---

## Cuentas de Acceso en la Aplicación

| Rol | Nombre | Correo | Contraseña | Vista asignada |
| :--- | :--- | :--- | :--- | :--- |
| 🛡️ **Administrador** | Ing. Carlos Mendoza | `admin@estiren.mx` | `admin123` | **Panel de Control y Operaciones (CEDIS)** |
| 👤 **Cliente 1** | Juan Pérez Lagunero | `juan.perez@comarca.mx` | `cliente123` | **Tienda en Línea y Carrito (Suc. Torreón)** |
| 👤 **Cliente 2** | Roberto Gómez Juárez | `roberto.gomez@villa.mx` | `cliente123` | **Tienda en Línea y Carrito (Suc. Villa Juárez)** |
| 👤 **Cliente 3** | Mariana López Lerdo | `mariana.lopez@lerdo.mx` | `cliente123` | **Tienda en Línea y Carrito (Suc. Lerdo)** |

---

## Conexiones a las 4 Bases de Datos (DBeaver / pgAdmin 4)

| Nodo / Sucursal | Host | Puerto | Base de Datos | Usuario | Contraseña |
| :--- | :--- | :---: | :--- | :--- | :--- |
| 🏢 **CEDIS Gómez Palacio** | `localhost` | `5433` | `estiren_cedis` | `estiren_admin` | `estiren_secret_password_2026` |
| 🏬 **Sucursal Torreón** | `localhost` | `5434` | `estiren_torreon` | `estiren_admin` | `estiren_secret_password_2026` |
| 🏬 **Sucursal Villa Juárez** | `localhost` | `5435` | `estiren_juarez` | `estiren_admin` | `estiren_secret_password_2026` |
| 🏬 **Sucursal Lerdo** | `localhost` | `5436` | `estiren_lerdo` | `estiren_admin` | `estiren_secret_password_2026` |

Para ver los Diagramas Entidad-Relación (ERD) detallados, consulta [`DIAGRAMAS_ER_Y_CONEXIONES.md`](./DIAGRAMAS_ER_Y_CONEXIONES.md).

---

## Cómo correr cada Base de Datos en PCs diferente (Modo Multi-PC en Red LAN / VPN)

El sistema soporta correr las 4 bases de datos en una sola computadora (`localhost`) o distribuirlas en **hasta 4 computadoras distintas** conectadas a la misma red Wi-Fi / LAN o mediante VPN (Tailscale / Radmin VPN / ZeroTier):

1. **En cada computadora**, levanta únicamente el contenedor de la sucursal que le corresponda:
   - **PC 1 (CEDIS — ej. IP `192.168.1.10`):** `docker compose up -d db_cedis`
   - **PC 2 (Torreón — ej. IP `192.168.1.11`):** `docker compose up -d db_torreon`
   - **PC 3 (Villa Juárez — ej. IP `192.168.1.12`):** `docker compose up -d db_juarez`
   - **PC 4 (Lerdo — ej. IP `192.168.1.13`):** `docker compose up -d db_lerdo`

2. **En la PC donde correrá la aplicación web (`npm run dev`)**, abre el archivo `.env.local` y pon la dirección IP de cada PC en las 4 variables (importante: pon la IP de red local incluso para la PC propia en lugar de `localhost` para que los demás contenedores puedan alcanzarla por red):
   ```env
   DB_CEDIS_URL=postgres://estiren_admin:estiren_secret_password_2026@192.168.1.10:5433/estiren_cedis
   DB_TORREON_URL=postgres://estiren_admin:estiren_secret_password_2026@192.168.1.11:5434/estiren_torreon
   DB_JUAREZ_URL=postgres://estiren_admin:estiren_secret_password_2026@192.168.1.12:5435/estiren_juarez
   DB_LERDO_URL=postgres://estiren_admin:estiren_secret_password_2026@192.168.1.13:5436/estiren_lerdo
   ```

3. **Ejecuta la sincronización automática:**
   ```bash
   npm run db:sync
   ```
   El script [`scripts/sync-db.mjs`](./scripts/sync-db.mjs) detectará automáticamente las IPs de `.env.local` y ejecutará `ALTER SERVER srv_torreon / srv_juarez / srv_lerdo` en las 4 bases de datos para que las **tablas federadas (`postgres_fdw`)** se comuniquen entre las distintas computadoras por su IP y puerto.

