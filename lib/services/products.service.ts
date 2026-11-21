import { getDbClient, BranchCode, BRANCHES } from "../db";
import {
  ProductStockInfo,
  FederatedStockRow,
  Customer,
  CheckoutInputCustomer,
  CartItem,
  SaleReceipt,
} from "../types";
import {
  getMockProductsWithStock,
  getMockFederatedStock,
  MOCK_CUSTOMERS_BY_BRANCH,
  MOCK_STOCK_BY_BRANCH,
} from "../mock-data";

export async function getProductsWithStock(
  branch: BranchCode = "torreon"
): Promise<{ products: ProductStockInfo[]; isLiveDb: boolean }> {
  try {
    const sql = getDbClient(branch);
    const rows = await sql`
      SELECT 
        p.sku,
        p.nombre,
        p.categoria_slug,
        p.precio::float,
        p.precio_original::float,
        p.emoji,
        p.descripcion,
        COALESCE(i.stock, 0)::int AS stock_local,
        COALESCE(i.pasillo, 'Pasillo 1') AS pasillo,
        COALESCE(i.estante, 'Estante A') AS estante
      FROM productos p
      LEFT JOIN inventario i ON p.sku = i.producto_sku
      ORDER BY p.id ASC;
    `;

    const fedRows = await sql`
      SELECT 
        sku,
        sucursal_codigo,
        stock::int
      FROM v_stock_multisucursal;
    `;

    const fedMap: Record<string, Record<BranchCode, number>> = {};
    for (const r of fedRows) {
      if (!fedMap[r.sku]) {
        fedMap[r.sku] = { torreon: 0, juarez: 0, lerdo: 0, cedis: 0 };
      }
      fedMap[r.sku][r.sucursal_codigo as BranchCode] = r.stock;
    }

    const branches: BranchCode[] = ["torreon", "juarez", "lerdo"];
    const otherBranches = branches.filter((b) => b !== branch);

    const products: ProductStockInfo[] = rows.map((r: any) => {
      const stockOtras: Record<BranchCode, number> = {
        torreon: 0,
        juarez: 0,
        lerdo: 0,
        cedis: 0,
      };

      let totalOtras = 0;
      otherBranches.forEach((b) => {
        const qty = fedMap[r.sku]?.[b] || 0;
        stockOtras[b] = qty;
        totalOtras += qty;
      });

      return {
        sku: r.sku,
        nombre: r.nombre,
        categoria_slug: r.categoria_slug,
        precio: r.precio,
        precio_original: r.precio_original,
        emoji: r.emoji,
        descripcion: r.descripcion,
        stock_local: r.stock_local,
        stock_otras: stockOtras,
        total_otras: totalOtras,
        pasillo: r.pasillo,
        estante: r.estante,
      };
    });

    return { products, isLiveDb: true };
  } catch (err) {
    console.warn(`[Estiren DB] Modo Simulación activo para sucursal ${branch}`);
    return {
      products: getMockProductsWithStock(branch),
      isLiveDb: false,
    };
  }
}

export async function getFederatedProductStock(
  sku: string,
  branch: BranchCode = "torreon"
): Promise<{ rows: FederatedStockRow[]; isLiveDb: boolean }> {
  try {
    const sql = getDbClient(branch);
    const rows = await sql`
      SELECT 
        sku,
        nombre,
        sucursal_codigo,
        sucursal_nombre,
        host_info,
        stock::int,
        es_local
      FROM v_stock_multisucursal
      WHERE sku = ${sku}
      ORDER BY es_local DESC, sucursal_codigo ASC;
    `;

    return {
      rows: rows as unknown as FederatedStockRow[],
      isLiveDb: true,
    };
  } catch (err) {
    return {
      rows: getMockFederatedStock(sku, branch),
      isLiveDb: false,
    };
  }
}

export async function getBranchCustomers(
  branch: BranchCode = "torreon"
): Promise<{ customers: Customer[]; isLiveDb: boolean }> {
  try {
    const sql = getDbClient(branch);
    const rows = await sql`
      SELECT DISTINCT ON (rfc, nombre)
        id::int,
        nombre,
        COALESCE(email, '') AS email,
        COALESCE(rfc, 'XAXX010101000') AS rfc,
        COALESCE(telefono, '') AS telefono
      FROM clientes
      ORDER BY rfc, nombre, id ASC;
    `;
    return {
      customers: rows as unknown as Customer[],
      isLiveDb: true,
    };
  } catch (err) {
    return {
      customers: MOCK_CUSTOMERS_BY_BRANCH[branch] || [],
      isLiveDb: false,
    };
  }
}

export async function processCheckoutOrder(
  branch: BranchCode,
  items: CartItem[],
  customer: CheckoutInputCustomer
): Promise<{ success: boolean; receipt: SaleReceipt | null; message: string }> {
  const total = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const subtotal = Number((total / 1.16).toFixed(2));
  const iva = Number((total - subtotal).toFixed(2));
  const folio = `VTA-${branch.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
  const nowStr = new Date().toLocaleString("es-MX");

  try {
    const sql = getDbClient(branch);

    await sql.begin(async (tx) => {
      // 1. Verificar existencias reales antes de cobrar
      for (const item of items) {
        const stockRow = await tx`
          SELECT stock::int FROM inventario WHERE producto_sku = ${item.sku} FOR UPDATE;
        `;
        const currentStock = stockRow[0]?.stock ?? 0;
        if (currentStock < item.cantidad) {
          throw new Error(
            `STOCK_INSUFICIENTE: Solo quedan ${currentStock} unidad(es) de "${item.nombre}" en ${BRANCHES[branch].name}.`
          );
        }
      }

      // 2. Obtener o insertar al cliente de forma única por RFC
      const rfcClean = (customer.rfc || "XAXX010101000").trim().toUpperCase();
      const existingRows = await tx`
        SELECT id::int
        FROM clientes
        WHERE rfc = ${rfcClean}
        ORDER BY id ASC
        LIMIT 1;
      `;

      let clienteId: number;
      if (existingRows.length > 0) {
        clienteId = existingRows[0].id;
        await tx`
          UPDATE clientes
          SET nombre = ${customer.nombre || "Cliente Mostrador"},
              email = ${customer.email || "cliente@estiren.mx"},
              telefono = ${customer.telefono || "871-000-0000"}
          WHERE id = ${clienteId};
        `;
      } else {
        const insertedClient = await tx`
          INSERT INTO clientes (nombre, email, rfc, telefono)
          VALUES (
            ${customer.nombre || "Cliente Mostrador"},
            ${customer.email || "cliente@estiren.mx"},
            ${rfcClean},
            ${customer.telefono || "871-000-0000"}
          )
          RETURNING id::int;
        `;
        clienteId = insertedClient[0].id;
      }

      // 3. Registrar la venta y sus partidas
      const insertedSale = await tx`
        INSERT INTO ventas (folio, cliente_id, subtotal, iva, total, sucursal_codigo)
        VALUES (${folio}, ${clienteId}, ${subtotal}, ${iva}, ${total}, ${branch})
        RETURNING id::int;
      `;
      const ventaId = insertedSale[0].id;

      for (const item of items) {
        const importe = Number((item.precio * item.cantidad).toFixed(2));
        await tx`
          INSERT INTO detalle_ventas (venta_id, producto_sku, cantidad, precio_unitario, importe)
          VALUES (${ventaId}, ${item.sku}, ${item.cantidad}, ${item.precio}, ${importe});
        `;

        await tx`
          UPDATE inventario 
          SET stock = stock - ${item.cantidad}
          WHERE producto_sku = ${item.sku};
        `;
      }
    });

    return {
      success: true,
      message: "Compra realizada con éxito.",
      receipt: {
        folio,
        fecha: nowStr,
        sucursal_nombre: BRANCHES[branch].name,
        sucursal_direccion: BRANCHES[branch].address,
        cliente_nombre: customer.nombre || "Cliente Mostrador",
        cliente_rfc: customer.rfc || "XAXX010101000",
        subtotal,
        iva,
        total,
        items,
        isLiveDb: true,
      },
    };
  } catch (err: any) {
    if (err?.message?.startsWith("STOCK_INSUFICIENTE:")) {
      return {
        success: false,
        message: err.message.replace("STOCK_INSUFICIENTE: ", ""),
        receipt: null,
      };
    }

    for (const item of items) {
      if (MOCK_STOCK_BY_BRANCH[item.sku]) {
        MOCK_STOCK_BY_BRANCH[item.sku][branch] = Math.max(
          0,
          (MOCK_STOCK_BY_BRANCH[item.sku][branch] || 0) - item.cantidad
        );
      }
    }

    return {
      success: true,
      message: `Compra registrada en ${BRANCHES[branch].name}`,
      receipt: {
        folio,
        fecha: nowStr,
        sucursal_nombre: BRANCHES[branch].name,
        sucursal_direccion: BRANCHES[branch].address,
        cliente_nombre: customer.nombre || "Cliente Mostrador",
        cliente_rfc: customer.rfc || "XAXX010101000",
        subtotal,
        iva,
        total,
        items,
        isLiveDb: false,
      },
    };
  }
}

export async function transferInterbranchStock(
  fromBranch: BranchCode,
  toBranch: BranchCode,
  sku: string,
  cantidad: number
): Promise<{ success: boolean; message: string; isLiveDb: boolean }> {
  if (fromBranch === toBranch) {
    return {
      success: false,
      message: "La sucursal origen y destino deben ser diferentes.",
      isLiveDb: false,
    };
  }

  try {
    const sqlFrom = getDbClient(fromBranch);
    const sqlTo = getDbClient(toBranch);

    const originRows = await sqlFrom`
      SELECT stock::int FROM inventario WHERE producto_sku = ${sku};
    `;
    const available = originRows[0]?.stock ?? 0;

    if (available < cantidad) {
      return {
        success: false,
        message: `${BRANCHES[fromBranch].name} solo cuenta con ${available} piezas disponibles de ${sku}.`,
        isLiveDb: true,
      };
    }

    // Descontar en sucursal origen
    await sqlFrom`
      UPDATE inventario
      SET stock = stock - ${cantidad}
      WHERE producto_sku = ${sku};
    `;

    // Incrementar en sucursal destino
    await sqlTo`
      UPDATE inventario
      SET stock = stock + ${cantidad}
      WHERE producto_sku = ${sku};
    `;

    // Registrar movimiento en la bitácora del CEDIS
    try {
      const sqlCedis = getDbClient("cedis");
      const folioTraspaso = `TRP-${fromBranch.slice(0, 3).toUpperCase()}-${toBranch.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`;
      await sqlCedis`
        INSERT INTO traspasos_almacen (folio, producto_sku, sucursal_origen, sucursal_destino, cantidad)
        VALUES (${folioTraspaso}, ${sku}, ${fromBranch}, ${toBranch}, ${cantidad});
      `;
    } catch {
      // Ignorar si la tabla aún no existe
    }

    return {
      success: true,
      message: `Traspaso completado: ${cantidad} pieza(s) enviadas de ${BRANCHES[fromBranch].name} a ${BRANCHES[toBranch].name}.`,
      isLiveDb: true,
    };
  } catch (err) {
    if (MOCK_STOCK_BY_BRANCH[sku]) {
      const avail = MOCK_STOCK_BY_BRANCH[sku][fromBranch] || 0;
      if (avail < cantidad) {
        return {
          success: false,
          message: `${BRANCHES[fromBranch].name} solo tiene ${avail} piezas disponibles.`,
          isLiveDb: false,
        };
      }
      MOCK_STOCK_BY_BRANCH[sku][fromBranch] -= cantidad;
      MOCK_STOCK_BY_BRANCH[sku][toBranch] = (MOCK_STOCK_BY_BRANCH[sku][toBranch] || 0) + cantidad;
    }

    return {
      success: true,
      message: `Traspaso completado: ${cantidad} pieza(s) enviadas de ${BRANCHES[fromBranch].name} a ${BRANCHES[toBranch].name}.`,
      isLiveDb: false,
    };
  }
}
