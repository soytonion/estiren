import fs from "fs";
import path from "path";
import postgres from "postgres";

/**
 * Lee las variables desde .env.local (o .env.example) sin requerir paquetes externos
 */
function loadEnvFile() {
  const envPath = fs.existsSync(path.resolve(".env.local"))
    ? path.resolve(".env.local")
    : path.resolve(".env.example");

  if (!fs.existsSync(envPath)) return {};

  const content = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

const fileEnv = loadEnvFile();

const URLS = {
  cedis:
    process.env.DB_CEDIS_URL ||
    fileEnv.DB_CEDIS_URL ||
    "postgres://estiren_admin:estiren_secret_password_2026@localhost:5433/estiren_cedis",
  torreon:
    process.env.DB_TORREON_URL ||
    fileEnv.DB_TORREON_URL ||
    "postgres://estiren_admin:estiren_secret_password_2026@localhost:5434/estiren_torreon",
  juarez:
    process.env.DB_JUAREZ_URL ||
    fileEnv.DB_JUAREZ_URL ||
    "postgres://estiren_admin:estiren_secret_password_2026@localhost:5435/estiren_juarez",
  lerdo:
    process.env.DB_LERDO_URL ||
    fileEnv.DB_LERDO_URL ||
    "postgres://estiren_admin:estiren_secret_password_2026@localhost:5436/estiren_lerdo",
};

function parseHostPort(connUrl, defaultPort) {
  try {
    const u = new URL(connUrl);
    return {
      host: u.hostname || "localhost",
      port: u.port || String(defaultPort),
    };
  } catch {
    return { host: "localhost", port: String(defaultPort) };
  }
}

const parsed = {
  cedis: parseHostPort(URLS.cedis, 5433),
  torreon: parseHostPort(URLS.torreon, 5434),
  juarez: parseHostPort(URLS.juarez, 5435),
  lerdo: parseHostPort(URLS.lerdo, 5436),
};

// Si todas las URLs son localhost / 127.0.0.1, usamos los nombres internos de la red Docker (db_torreon:5432, etc.).
// Si se especificaron IPs de red (ej. 192.168.1.x o VPN), configuramos postgres_fdw con las IPs y puertos expuestos de cada PC.
const isSingleLocalMachine = [
  parsed.cedis.host,
  parsed.torreon.host,
  parsed.juarez.host,
  parsed.lerdo.host,
].every((h) => h === "localhost" || h === "127.0.0.1");

const fdwTargets = {
  torreon: isSingleLocalMachine
    ? { host: "db_torreon", port: "5432" }
    : { host: parsed.torreon.host, port: parsed.torreon.port },
  juarez: isSingleLocalMachine
    ? { host: "db_juarez", port: "5432" }
    : { host: parsed.juarez.host, port: parsed.juarez.port },
  lerdo: isSingleLocalMachine
    ? { host: "db_lerdo", port: "5432" }
    : { host: parsed.lerdo.host, port: parsed.lerdo.port },
};

const cleanupClientsSql = `
  UPDATE ventas v
  SET cliente_id = c_min.min_id
  FROM clientes c
  JOIN (SELECT rfc, MIN(id) AS min_id FROM clientes GROUP BY rfc) c_min ON c.rfc = c_min.rfc
  WHERE v.cliente_id = c.id AND c.id <> c_min.min_id;

  DELETE FROM clientes a USING clientes b WHERE a.id > b.id AND a.rfc = b.rfc;

  DELETE FROM clientes
  WHERE id NOT IN (SELECT DISTINCT cliente_id FROM ventas WHERE cliente_id IS NOT NULL)
    AND rfc NOT IN ('PELJ850412XX1', 'GOJR781105BB3', 'LOMM910720CC4');

  ALTER TABLE inventario ADD COLUMN IF NOT EXISTS sucursal_codigo VARCHAR(20);

  DO $$ BEGIN
    ALTER TABLE inventario ADD CONSTRAINT fk_inventario_sucursal FOREIGN KEY (sucursal_codigo) REFERENCES sucursales(codigo);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  DO $$ BEGIN
    ALTER TABLE ventas ADD CONSTRAINT fk_ventas_sucursal FOREIGN KEY (sucursal_codigo) REFERENCES sucursales(codigo);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

const configs = [
  {
    key: "torreon",
    name: "Sucursal Torreón",
    url: URLS.torreon,
    sqlFile: "docker/init/torreon/01_init.sql",
    dropViews: "DROP VIEW IF EXISTS v_stock_multisucursal CASCADE;",
    isBranch: true,
    remoteServers: ["juarez", "lerdo"],
  },
  {
    key: "juarez",
    name: "Sucursal Villa Juárez",
    url: URLS.juarez,
    sqlFile: "docker/init/juarez/01_init.sql",
    dropViews: "DROP VIEW IF EXISTS v_stock_multisucursal CASCADE;",
    isBranch: true,
    remoteServers: ["torreon", "lerdo"],
  },
  {
    key: "lerdo",
    name: "Sucursal Lerdo",
    url: URLS.lerdo,
    sqlFile: "docker/init/lerdo/01_init.sql",
    dropViews: "DROP VIEW IF EXISTS v_stock_multisucursal CASCADE;",
    isBranch: true,
    remoteServers: ["torreon", "juarez"],
  },
  {
    key: "cedis",
    name: "CEDIS Gómez Palacio (Hub)",
    url: URLS.cedis,
    sqlFile: "docker/init/cedis/01_init.sql",
    dropViews:
      "DROP VIEW IF EXISTS v_ventas_consolidadas, v_ventas_todas, v_stock_global, v_clientes_federados CASCADE;",
    isBranch: false,
    remoteServers: ["torreon", "juarez", "lerdo"],
  },
];

async function run() {
  console.log(
    isSingleLocalMachine
      ? "🖥️ Modo detectado: 1 Sola PC (Red interna Docker bridge)"
      : "🌐 Modo detectado: Múltiples PCs en Red LAN / VPN (IPs personalizadas desde .env.local)"
  );

  for (const cfg of configs) {
    const hostInfo = parsed[cfg.key];
    console.log(
      `\n🔄 Sincronizando ${cfg.name} en ${hostInfo.host}:${hostInfo.port}...`
    );
    const sql = postgres(cfg.url, {
      max: 1,
      connect_timeout: 5,
      onnotice: () => {},
    });

    try {
      await sql.unsafe(cfg.dropViews);
      if (cfg.isBranch) {
        await sql.unsafe(cleanupClientsSql);
      }
      const scriptContent = fs.readFileSync(path.resolve(cfg.sqlFile), "utf8");
      await sql.unsafe(scriptContent);

      // Actualizar dinámicamente el host y puerto de cada FOREIGN SERVER (srv_torreon, srv_juarez, srv_lerdo)
      for (const remoteKey of cfg.remoteServers) {
        const target = fdwTargets[remoteKey];
        await sql.unsafe(`
          ALTER SERVER srv_${remoteKey}
          OPTIONS (SET host '${target.host}', SET port '${target.port}');
        `);
      }

      console.log(
        `✅ ${cfg.name} sincronizada. Servidores FDW apuntando a:`,
        cfg.remoteServers
          .map((k) => `srv_${k} -> ${fdwTargets[k].host}:${fdwTargets[k].port}`)
          .join(", ")
      );
    } catch (err) {
      console.error(`❌ Error en ${cfg.name}:`, err.message);
    } finally {
      await sql.end();
    }
  }
}

run().catch(console.error);
