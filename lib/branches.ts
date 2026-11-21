export type BranchCode = "torreon" | "juarez" | "lerdo" | "cedis";

export interface BranchInfo {
  code: BranchCode;
  name: string;
  dbName: string;
  port: number;
  address: string;
  phone: string;
  isHub?: boolean;
}

export const BRANCHES: Record<BranchCode, BranchInfo> = {
  torreon: {
    code: "torreon",
    name: "Sucursal Torreón",
    dbName: "estiren_torreon",
    port: 5434,
    address: "Calle Falsa #123 Zona Centro, Torreón, Coah.",
    phone: "871-700-1122",
  },
  juarez: {
    code: "juarez",
    name: "Sucursal Villa Juárez",
    dbName: "estiren_juarez",
    port: 5435,
    address: "Av. Collazo #1 Cd. Juárez, Dgo.",
    phone: "871-700-3344",
  },
  lerdo: {
    code: "lerdo",
    name: "Sucursal Lerdo",
    dbName: "estiren_lerdo",
    port: 5436,
    address: "Av. 6 de Abril #1818 Pte. Lerdo, Dgo.",
    phone: "871-700-5566",
  },
  cedis: {
    code: "cedis",
    name: "CEDIS Gómez Palacio (Hub Central)",
    dbName: "estiren_cedis",
    port: 5433,
    address: "En algún lugar de Gómez Palacio, Dgo.",
    phone: "871-700-0000",
    isHub: true,
  },
};
