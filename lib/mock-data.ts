import {
  Product,
  ProductStockInfo,
  FederatedStockRow,
  CedisBranchMetric,
  CedisGlobalStockRow,
  Customer,
  FederatedSaleRow,
  FederatedCustomerRow,
} from "./types";
import { BranchCode, BRANCHES } from "./branches";

export const MOCK_PRODUCTS: Product[] = [
  {
    sku: "EST-4020",
    nombre: "Cautín 60W con Mango Calefactable Involuntario",
    categoria_slug: "herramientas",
    precio: 349,
    precio_original: 499,
    emoji: "🔥",
    descripcion:
      "Diseñado para soldaduras rápidas antes de que el mango alcance la misma temperatura que la punta. Incluye soporte de lámina delgada.",
  },
  {
    sku: "CAB-VGA-HOSE",
    nombre: 'Adaptador VGA Macho a Manguera de Jardín 1/2"',
    categoria_slug: "cables",
    precio: 189,
    precio_original: 220,
    emoji: "🚿",
    descripcion:
      "Transmite datos analógicos a 60 PSI de presión de agua. Ideal para regar el patio mientras proyectas diapositivas.",
  },
  {
    sku: "BAT-9V-LEMON",
    nombre: "Batería Cuadrada 9V Sabor Limón Ácido",
    categoria_slug: "energia",
    precio: 75,
    precio_original: 90,
    emoji: "🍋",
    descripcion:
      "Para quienes todavía prueban si la pila tiene carga poniéndosela en la lengua. Sabor cítrico mejorado libre de mercurio.",
  },
  {
    sku: "MUL-FE-900",
    nombre: "Multímetro para Medir la Fe de tus Circuitos",
    categoria_slug: "herramientas",
    precio: 520,
    precio_original: 650,
    emoji: "📟",
    descripcion:
      "Mide voltaje, amperaje y la probabilidad de que tu prototipo explote al conectarlo. Beep continuo cuando huele a quemado.",
  },
  {
    sku: "ARD-BLINK-13",
    nombre: "Arduino Uno que Solo Parpadea el Pin 13",
    categoria_slug: "arduino",
    precio: 160,
    precio_original: 210,
    emoji: "💡",
    descripcion:
      "Bootloader preprogramado para que nunca logres subir otro sketch que no sea el blink básico. Ahorra frustración.",
  },
  {
    sku: "CAB-USB-PELADO",
    nombre: "Cable USB-C a Contacto Bifásico Pelado",
    categoria_slug: "cables",
    precio: 99,
    precio_original: 150,
    emoji: "⚡",
    descripcion:
      "Carga ultrarrápida a 127 Volts directos. Recomendamos alejarse 3 metros al conectar a la pared.",
  },
  {
    sku: "PROT-HUMO-300",
    nombre: "Extractor de Humo Mágico de Circuitos",
    categoria_slug: "herramientas",
    precio: 430,
    precio_original: 580,
    emoji: "💨",
    descripcion:
      "Todos saben que los circuitos funcionan con humo mágico dentro. Si sale, ya no sirven. Este extractor no lo arregla, pero huele rico.",
  },
  {
    sku: "LED-AZUL-CEGADOR",
    nombre: "LED Azul Ultrabrillante Rompe-Retinas 10mm",
    categoria_slug: "arduino",
    precio: 25,
    precio_original: 35,
    emoji: "🔦",
    descripcion:
      "Ilumina toda tu recámara de noche cuando solo querías saber si la bocina estaba en Standby.",
  },
];

export const MOCK_STOCK_BY_BRANCH: Record<string, Record<BranchCode, number>> = {
  "EST-4020": { torreon: 14, juarez: 3, lerdo: 0, cedis: 50 },
  "CAB-VGA-HOSE": { torreon: 0, juarez: 12, lerdo: 5, cedis: 30 },
  "BAT-9V-LEMON": { torreon: 45, juarez: 20, lerdo: 32, cedis: 200 },
  "MUL-FE-900": { torreon: 2, juarez: 0, lerdo: 8, cedis: 15 },
  "ARD-BLINK-13": { torreon: 8, juarez: 15, lerdo: 18, cedis: 40 },
  "CAB-USB-PELADO": { torreon: 0, juarez: 4, lerdo: 1, cedis: 25 },
  "PROT-HUMO-300": { torreon: 5, juarez: 2, lerdo: 0, cedis: 10 },
  "LED-AZUL-CEGADOR": { torreon: 120, juarez: 85, lerdo: 94, cedis: 1000 },
};

export function getMockProductsWithStock(activeBranch: BranchCode): ProductStockInfo[] {
  return MOCK_PRODUCTS.map((prod) => {
    const stockMap = MOCK_STOCK_BY_BRANCH[prod.sku] || {
      torreon: 0,
      juarez: 0,
      lerdo: 0,
      cedis: 0,
    };
    const stockLocal = stockMap[activeBranch] || 0;
    const branches: BranchCode[] = ["torreon", "juarez", "lerdo"];
    const otherBranches = branches.filter((b) => b !== activeBranch);

    const stockOtras: Record<BranchCode, number> = {
      torreon: 0,
      juarez: 0,
      lerdo: 0,
      cedis: 0,
    };

    let totalOtras = 0;
    otherBranches.forEach((b) => {
      stockOtras[b] = stockMap[b] || 0;
      totalOtras += stockMap[b] || 0;
    });

    return {
      ...prod,
      stock_local: stockLocal,
      stock_otras: stockOtras,
      total_otras: totalOtras,
      pasillo: "Pasillo 1",
      estante: "Estante A",
    };
  });
}

export function getMockFederatedStock(sku: string, activeBranch: BranchCode): FederatedStockRow[] {
  const stockMap = MOCK_STOCK_BY_BRANCH[sku] || {
    torreon: 0,
    juarez: 0,
    lerdo: 0,
    cedis: 0,
  };
  const branches: BranchCode[] = ["torreon", "juarez", "lerdo"];

  return branches.map((b) => ({
    sku,
    nombre: MOCK_PRODUCTS.find((p) => p.sku === sku)?.nombre || "Producto",
    sucursal_codigo: b,
    sucursal_nombre: BRANCHES[b].name,
    host_info: `db_sucursal_${b}:${BRANCHES[b].port}`,
    stock: stockMap[b] || 0,
    es_local: b === activeBranch,
  }));
}

export const MOCK_CUSTOMERS_BY_BRANCH: Record<BranchCode, Customer[]> = {
  torreon: [
    {
      id: 1,
      nombre: "Juan Pérez Lagunero",
      email: "juan.perez@comarca.mx",
      rfc: "PELJ850412XX1",
      telefono: "871-123-4567",
    },
    {
      id: 2,
      nombre: "Electrónica El Cautín Veloz",
      email: "contacto@cautinveloz.com",
      rfc: "ECV990214AA2",
      telefono: "871-987-6543",
    },
  ],
  juarez: [
    {
      id: 1,
      nombre: "Roberto Gómez Juárez",
      email: "roberto.gomez@villa.mx",
      rfc: "GOJR781105BB3",
      telefono: "871-332-9012",
    },
  ],
  lerdo: [
    {
      id: 1,
      nombre: "Mariana López Lerdo",
      email: "mariana.lopez@lerdo.mx",
      rfc: "LOMM910720CC4",
      telefono: "871-667-8899",
    },
  ],
  cedis: [],
};

export const MOCK_CEDIS_METRICS: CedisBranchMetric[] = [
  {
    sucursal_codigo: "torreon",
    sucursal_nombre: "Sucursal Torreón",
    puerto: "5434",
    tickets_emitidos: 2,
    unidades_vendidas: 4,
    total_ventas: 1639,
  },
  {
    sucursal_codigo: "juarez",
    sucursal_nombre: "Sucursal Villa Juárez",
    puerto: "5435",
    tickets_emitidos: 2,
    unidades_vendidas: 11,
    total_ventas: 939,
  },
  {
    sucursal_codigo: "lerdo",
    sucursal_nombre: "Sucursal Lerdo",
    puerto: "5436",
    tickets_emitidos: 2,
    unidades_vendidas: 3,
    total_ventas: 840,
  },
];

export const MOCK_CEDIS_GLOBAL_STOCK: CedisGlobalStockRow[] = MOCK_PRODUCTS.map((prod) => {
  const map = MOCK_STOCK_BY_BRANCH[prod.sku] || {
    torreon: 0,
    juarez: 0,
    lerdo: 0,
    cedis: 0,
  };
  return {
    sku: prod.sku,
    nombre: prod.nombre,
    categoria_slug: prod.categoria_slug,
    precio: prod.precio,
    emoji: prod.emoji,
    stock_torreon: map.torreon,
    stock_juarez: map.juarez,
    stock_lerdo: map.lerdo,
    stock_total_red: map.torreon + map.juarez + map.lerdo,
  };
});

export const MOCK_FEDERATED_SALES: FederatedSaleRow[] = [
  {
    sucursal_codigo: "torreon",
    sucursal_nombre: "Sucursal Torreón",
    puerto: "5434",
    id: 1,
    folio: "VTA-TRC-001",
    fecha: new Date().toISOString(),
    cliente_nombre: "Juan Pérez Lagunero",
    subtotal: 601.72,
    iva: 96.28,
    total: 698,
    unidades: 2,
  },
  {
    sucursal_codigo: "juarez",
    sucursal_nombre: "Sucursal Villa Juárez",
    puerto: "5435",
    id: 1,
    folio: "VTA-JRA-001",
    fecha: new Date().toISOString(),
    cliente_nombre: "Roberto Gómez Juárez",
    subtotal: 325.86,
    iva: 52.14,
    total: 378,
    unidades: 2,
  },
  {
    sucursal_codigo: "lerdo",
    sucursal_nombre: "Sucursal Lerdo",
    puerto: "5436",
    id: 1,
    folio: "VTA-LRD-001",
    fecha: new Date().toISOString(),
    cliente_nombre: "Mariana López Lerdo",
    subtotal: 448.28,
    iva: 71.72,
    total: 520,
    unidades: 1,
  },
];

export const MOCK_FEDERATED_CUSTOMERS: FederatedCustomerRow[] = [
  {
    sucursal_codigo: "torreon",
    sucursal_nombre: "Sucursal Torreón",
    cliente_id: 1,
    nombre: "Juan Pérez Lagunero",
    email: "juan.perez@comarca.mx",
    rfc: "PELJ850412XX1",
    telefono: "871-123-4567",
    total_compras: 2,
    monto_acumulado: 1639,
  },
  {
    sucursal_codigo: "juarez",
    sucursal_nombre: "Sucursal Villa Juárez",
    cliente_id: 1,
    nombre: "Roberto Gómez Juárez",
    email: "roberto.gomez@villa.mx",
    rfc: "GOJR781105BB3",
    telefono: "871-332-9012",
    total_compras: 2,
    monto_acumulado: 939,
  },
  {
    sucursal_codigo: "lerdo",
    sucursal_nombre: "Sucursal Lerdo",
    cliente_id: 1,
    nombre: "Mariana López Lerdo",
    email: "mariana.lopez@lerdo.mx",
    rfc: "LOMM910720CC4",
    telefono: "871-667-8899",
    total_compras: 2,
    monto_acumulado: 840,
  },
];
