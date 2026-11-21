import { BranchCode } from "./branches";

export interface Category {
  id?: number;
  slug: string;
  nombre: string;
  descripcion?: string;
}

export interface Product {
  id?: number;
  sku: string;
  nombre: string;
  categoria_slug: string;
  precio: number;
  precio_original: number;
  emoji: string;
  descripcion: string;
}

export interface ProductStockInfo extends Product {
  stock_local: number;
  stock_otras: Record<BranchCode, number>;
  total_otras: number;
  pasillo?: string;
  estante?: string;
}

export interface FederatedStockRow {
  sku: string;
  nombre: string;
  sucursal_codigo: BranchCode;
  sucursal_nombre: string;
  host_info: string;
  stock: number;
  es_local: boolean;
}

export interface CartItem {
  sku: string;
  nombre: string;
  precio: number;
  emoji: string;
  cantidad: number;
}

export interface Customer {
  id: number;
  nombre: string;
  email: string;
  rfc: string;
  telefono: string;
}

export interface CheckoutInputCustomer {
  id?: number;
  nombre: string;
  email: string;
  rfc: string;
  telefono: string;
}

export interface SaleReceipt {
  folio: string;
  fecha: string;
  sucursal_nombre: string;
  sucursal_direccion: string;
  cliente_nombre: string;
  cliente_rfc: string;
  subtotal: number;
  iva: number;
  total: number;
  items: CartItem[];
  isLiveDb: boolean;
}

export interface CedisBranchMetric {
  sucursal_codigo: BranchCode;
  sucursal_nombre: string;
  puerto: string;
  tickets_emitidos: number;
  unidades_vendidas: number;
  total_ventas: number;
}

export interface CedisGlobalStockRow {
  sku: string;
  nombre: string;
  categoria_slug: string;
  precio: number;
  emoji: string;
  stock_torreon: number;
  stock_juarez: number;
  stock_lerdo: number;
  stock_total_red: number;
}

export interface FederatedSaleRow {
  sucursal_codigo: BranchCode;
  sucursal_nombre: string;
  puerto: string;
  id: number;
  folio: string;
  fecha: string;
  cliente_nombre: string;
  cliente_rfc?: string;
  subtotal: number;
  iva: number;
  total: number;
  unidades: number;
  articulos_detalle?: string;
}

export interface FederatedCustomerRow {
  sucursal_codigo: BranchCode;
  sucursal_nombre: string;
  cliente_id: number;
  nombre: string;
  email: string;
  rfc: string;
  telefono: string;
  total_compras: number;
  monto_acumulado: number;
}

export interface NodeHealth {
  branch: BranchCode;
  name: string;
  dbName: string;
  port: number;
  online: boolean;
  latencyMs: number;
}
