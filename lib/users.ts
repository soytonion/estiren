import { BranchCode } from "./branches";

export interface AppUser {
  id: string;
  role: "admin" | "customer";
  nombre: string;
  email: string;
  password: string;
  rfc: string;
  telefono: string;
  defaultBranch: BranchCode;
  badge: string;
}

export const TEST_USERS: AppUser[] = [
  {
    id: "admin-cedis",
    role: "admin",
    nombre: "Ing. Carlos Mendoza (Administrador)",
    email: "admin@estiren.mx",
    password: "admin123",
    rfc: "EST991231ADM",
    telefono: "871-700-0000",
    defaultBranch: "torreon",
    badge: "Administrador General • CEDIS Gómez Palacio",
  },
  {
    id: "cliente-1",
    role: "customer",
    nombre: "Juan Pérez Lagunero",
    email: "juan.perez@comarca.mx",
    password: "cliente123",
    rfc: "PELJ850412XX1",
    telefono: "871-123-4567",
    defaultBranch: "torreon",
    badge: "Cliente Frecuente • Torreón",
  },
  {
    id: "cliente-2",
    role: "customer",
    nombre: "Roberto Gómez Juárez",
    email: "roberto.gomez@villa.mx",
    password: "cliente123",
    rfc: "GOJR781105BB3",
    telefono: "871-332-9012",
    defaultBranch: "juarez",
    badge: "Cliente Frecuente • Villa Juárez",
  },
  {
    id: "cliente-3",
    role: "customer",
    nombre: "Mariana López Lerdo",
    email: "mariana.lopez@lerdo.mx",
    password: "cliente123",
    rfc: "LOMM910720CC4",
    telefono: "871-667-8899",
    defaultBranch: "lerdo",
    badge: "Cliente Frecuente • Lerdo",
  },
];
