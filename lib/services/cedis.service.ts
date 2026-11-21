import { getDbClient, BranchCode, BRANCHES } from "../db";
import {
  CedisBranchMetric,
  CedisGlobalStockRow,
  FederatedSaleRow,
  FederatedCustomerRow,
  NodeHealth,
} from "../types";
import {
  MOCK_CEDIS_METRICS,
  MOCK_CEDIS_GLOBAL_STOCK,
  MOCK_FEDERATED_SALES,
  MOCK_FEDERATED_CUSTOMERS,
} from "../mock-data";

export async function checkAllNodesHealth(): Promise<NodeHealth[]> {
  const nodes: BranchCode[] = ["cedis", "torreon", "juarez", "lerdo"];
  const results = await Promise.all(
    nodes.map(async (b) => {
      const start = Date.now();
      try {
        const sql = getDbClient(b);
        await sql`SELECT 1`;
        return {
          branch: b,
          name: BRANCHES[b].name,
          dbName: BRANCHES[b].dbName,
          port: BRANCHES[b].port,
          online: true,
          latencyMs: Math.max(1, Date.now() - start),
        };
      } catch {
        return {
          branch: b,
          name: BRANCHES[b].name,
          dbName: BRANCHES[b].dbName,
          port: BRANCHES[b].port,
          online: false,
          latencyMs: 0,
        };
      }
    })
  );
  return results;
}

export async function getCedisMetrics(): Promise<{
  metrics: CedisBranchMetric[];
  globalStock: CedisGlobalStockRow[];
  recentSales: FederatedSaleRow[];
  federatedCustomers: FederatedCustomerRow[];
  nodesHealth: NodeHealth[];
  isLiveDb: boolean;
}> {
  try {
    const sql = getDbClient("cedis");

    const [metricsRows, stockRows, salesRows, customerRows, nodesHealth] =
      await Promise.all([
        sql`
          SELECT 
            sucursal_codigo,
            sucursal_nombre,
            puerto,
            tickets_emitidos::int,
            COALESCE(unidades_vendidas, 0)::int AS unidades_vendidas,
            total_ventas::float
          FROM v_ventas_consolidadas
          ORDER BY total_ventas DESC;
        `,
        sql`
          SELECT 
            sku,
            nombre,
            categoria_slug,
            precio::float,
            emoji,
            stock_torreon::int,
            stock_juarez::int,
            stock_lerdo::int,
            stock_total_red::int
          FROM v_stock_global
          ORDER BY sku ASC;
        `,
        sql`
          SELECT 
            sucursal_codigo,
            sucursal_nombre,
            puerto,
            id::int,
            folio,
            TO_CHAR(fecha, 'DD/MM/YYYY HH24:MI') AS fecha,
            cliente_nombre,
            cliente_rfc,
            subtotal::float,
            iva::float,
            total::float,
            unidades::int,
            articulos_detalle
          FROM v_ventas_todas
          ORDER BY v_ventas_todas.fecha DESC, id DESC
          LIMIT 40;
        `,
        sql`
          SELECT 
            sucursal_codigo,
            sucursal_nombre,
            MIN(cliente_id)::int AS cliente_id,
            MAX(nombre) AS nombre,
            MAX(email) AS email,
            rfc,
            MAX(telefono) AS telefono,
            SUM(total_compras)::int AS total_compras,
            SUM(monto_acumulado)::float AS monto_acumulado
          FROM v_clientes_federados
          GROUP BY sucursal_codigo, sucursal_nombre, rfc
          ORDER BY monto_acumulado DESC, nombre ASC;
        `,
        checkAllNodesHealth(),
      ]);

    return {
      metrics: metricsRows as unknown as CedisBranchMetric[],
      globalStock: stockRows as unknown as CedisGlobalStockRow[],
      recentSales: salesRows as unknown as FederatedSaleRow[],
      federatedCustomers: customerRows as unknown as FederatedCustomerRow[],
      nodesHealth,
      isLiveDb: true,
    };
  } catch (err) {
    const fallbackNodes: NodeHealth[] = (
      ["cedis", "torreon", "juarez", "lerdo"] as BranchCode[]
    ).map((b) => ({
      branch: b,
      name: BRANCHES[b].name,
      dbName: BRANCHES[b].dbName,
      port: BRANCHES[b].port,
      online: false,
      latencyMs: 0,
    }));

    return {
      metrics: MOCK_CEDIS_METRICS,
      globalStock: MOCK_CEDIS_GLOBAL_STOCK,
      recentSales: MOCK_FEDERATED_SALES,
      federatedCustomers: MOCK_FEDERATED_CUSTOMERS,
      nodesHealth: fallbackNodes,
      isLiveDb: false,
    };
  }
}
