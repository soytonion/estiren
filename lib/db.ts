import postgres from "postgres";
import { BranchCode, BRANCHES } from "./branches";

export { type BranchCode, type BranchInfo, BRANCHES } from "./branches";

// Cache de pools de conexiones
const clientPools: Partial<Record<BranchCode, ReturnType<typeof postgres>>> = {};

export function getDbClient(branch: BranchCode = "torreon") {
  if (clientPools[branch]) {
    return clientPools[branch]!;
  }

  const envKey = `DB_${branch.toUpperCase()}_URL`;
  const url =
    process.env[envKey] ||
    `postgres://estiren_admin:estiren_secret_password_2026@localhost:${BRANCHES[branch].port}/${BRANCHES[branch].dbName}`;

  const client = postgres(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 3,
  });

  clientPools[branch] = client;
  return client;
}
