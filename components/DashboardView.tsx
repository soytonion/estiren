"use client";

import React, { useState, useMemo } from "react";
import {
  RefreshCw,
  DollarSign,
  Receipt,
  AlertTriangle,
  Users,
  ArrowRightLeft,
  FileSpreadsheet,
  Store,
} from "lucide-react";
import {
  CedisBranchMetric,
  CedisGlobalStockRow,
  FederatedSaleRow,
  FederatedCustomerRow,
  NodeHealth,
} from "../lib/types";
import { BranchCode, BRANCHES } from "../lib/branches";

interface DashboardViewProps {
  metrics: CedisBranchMetric[];
  globalStock: CedisGlobalStockRow[];
  recentSales: FederatedSaleRow[];
  federatedCustomers: FederatedCustomerRow[];
  nodesHealth: NodeHealth[];
  isLiveDb?: boolean;
  onRefresh: () => void;
  onQuickTransfer: (
    fromBranch: BranchCode,
    toBranch: BranchCode,
    sku: string,
    cantidad: number
  ) => Promise<void>;
}

interface ConsolidatedCustomer {
  rfc: string;
  nombre: string;
  email: string;
  telefono: string;
  sucursales: string[];
  total_compras: number;
  monto_acumulado: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  globalStock,
  recentSales,
  federatedCustomers,
  onRefresh,
  onQuickTransfer,
}) => {
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("all");
  const [activeSubTab, setActiveSubTab] = useState<"inventory" | "sales" | "customers">(
    "inventory"
  );
  const [transferringSku, setTransferringSku] = useState<string | null>(null);

  const filteredMetrics =
    selectedBranchFilter === "all"
      ? metrics
      : metrics.filter((m) => m.sucursal_codigo === selectedBranchFilter);

  const filteredSales =
    selectedBranchFilter === "all"
      ? recentSales
      : recentSales.filter((s) => s.sucursal_codigo === selectedBranchFilter);

  // Consolidar clientes por RFC para que un mismo cliente que compra en varias sucursales NO se duplique
  const consolidatedCustomers = useMemo<ConsolidatedCustomer[]>(() => {
    const sourceRows =
      selectedBranchFilter === "all"
        ? federatedCustomers
        : federatedCustomers.filter((c) => c.sucursal_codigo === selectedBranchFilter);

    const map = new Map<string, ConsolidatedCustomer>();

    for (const row of sourceRows) {
      const key = (row.rfc || row.nombre).toUpperCase();
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          rfc: row.rfc,
          nombre: row.nombre,
          email: row.email,
          telefono: row.telefono,
          sucursales: [row.sucursal_nombre],
          total_compras: row.total_compras,
          monto_acumulado: row.monto_acumulado,
        });
      } else {
        if (!existing.sucursales.includes(row.sucursal_nombre)) {
          existing.sucursales.push(row.sucursal_nombre);
        }
        existing.total_compras += row.total_compras;
        existing.monto_acumulado += row.monto_acumulado;
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => b.monto_acumulado - a.monto_acumulado
    );
  }, [federatedCustomers, selectedBranchFilter]);

  const totalSales = filteredMetrics.reduce((acc, m) => acc + m.total_ventas, 0);
  const totalTickets = filteredMetrics.reduce((acc, m) => acc + m.tickets_emitidos, 0);
  const criticalStockCount = globalStock.filter((p) => p.stock_total_red < 10).length;

  const handleExecuteSuggestedTransfer = async (
    from: BranchCode,
    to: BranchCode,
    sku: string,
    qty: number
  ) => {
    setTransferringSku(sku);
    try {
      await onQuickTransfer(from, to, sku, qty);
    } finally {
      setTransferringSku(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Dashboard */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-steren text-white px-2 py-0.5 rounded text-xs font-bold uppercase">
              CEDIS Laguna
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Panel de Control y Operaciones — Gómez Palacio
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervisión general de existencias en sucursales, historial de ventas y
            padrón unificado de clientes de toda la región.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-steren"
          >
            <option value="all">🌐 Todas las Sucursales (Región Laguna)</option>
            <option value="torreon">🏬 Sucursal Torreón</option>
            <option value="juarez">🏬 Sucursal Villa Juárez</option>
            <option value="lerdo">🏬 Sucursal Lerdo</option>
          </select>
          <button
            onClick={onRefresh}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Actualizar Datos</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ventas Acumuladas
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ${totalSales.toLocaleString("es-MX")}.00
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              ▲ Corte actualizado al momento
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-steren rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tickets Emitidos
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalTickets.toLocaleString("es-MX")}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1">
              Ticket promedio: $
              {totalTickets > 0 ? Math.round(totalSales / totalTickets) : 0} MXN
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Clientes Únicos
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {consolidatedCustomers.length} Clientes
            </div>
            <span className="text-[11px] text-blue-600 font-semibold mt-1">
              Padrón unificado por RFC
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-steren rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Artículos por Resurtir
            </span>
            <div className="text-2xl font-black text-red-600 mt-1">
              {criticalStockCount} Modelos
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              Menos de 10 piezas en región
            </span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabla comparativa por sucursal */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Store className="w-4 h-4 text-steren" />
            <span>Desempeño Comercial por Sucursal</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Sucursal</th>
                <th className="py-3 px-4">Dirección</th>
                <th className="py-3 px-4 text-right">Ventas Totales</th>
                <th className="py-3 px-4 text-center">Tickets</th>
                <th className="py-3 px-4 text-center">Artículos Vendidos</th>
                <th className="py-3 px-4 text-center">Horario / Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMetrics.map((m) => {
                const branchMeta = BRANCHES[m.sucursal_codigo];
                return (
                  <tr key={m.sucursal_codigo} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {m.sucursal_nombre}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {branchMeta?.address}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-steren font-mono">
                      ${m.total_ventas.toLocaleString("es-MX")}.00
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {m.tickets_emitidos}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      {m.unidades_vendidas} pzas
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Abierta • En Servicio
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selector de Sub-Vistas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
        <button
          onClick={() => setActiveSubTab("inventory")}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
            activeSubTab === "inventory"
              ? "bg-steren text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Inventario por Tienda y Traspasos</span>
        </button>

        <button
          onClick={() => setActiveSubTab("sales")}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
            activeSubTab === "sales"
              ? "bg-steren text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Historial de Ventas ({filteredSales.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("customers")}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
            activeSubTab === "customers"
              ? "bg-steren text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Directorio de Clientes ({consolidatedCustomers.length})</span>
        </button>
      </div>

      {/* SUB-VISTA 1: MATRIZ DE INVENTARIO */}
      {activeSubTab === "inventory" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                📦 Existencias por Sucursal y Reabastecimiento
              </h3>
              <p className="text-xs text-slate-500">
                Consulta las unidades disponibles en cada tienda de la Laguna y envía
                mercancía entre sucursales cuando alguna se agote.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Modelo</th>
                  <th className="py-2.5 px-3">Artículo</th>
                  <th className="py-2.5 px-3 text-center">Suc. Torreón</th>
                  <th className="py-2.5 px-3 text-center">Suc. Villa Juárez</th>
                  <th className="py-2.5 px-3 text-center">Suc. Lerdo</th>
                  <th className="py-2.5 px-3 text-center font-bold text-steren">
                    Total en Tiendas
                  </th>
                  <th className="py-2.5 px-3 text-center">Acción de Almacén</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {globalStock.map((p) => {
                  let actionElement = (
                    <span className="text-slate-400">Abasto suficiente</span>
                  );

                  if (p.stock_torreon === 0 && p.stock_juarez >= 2) {
                    const qtyToMove = Math.min(3, p.stock_juarez);
                    actionElement = (
                      <button
                        disabled={transferringSku === p.sku}
                        onClick={() =>
                          handleExecuteSuggestedTransfer(
                            "juarez",
                            "torreon",
                            p.sku,
                            qtyToMove
                          )
                        }
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded transition text-[11px]"
                      >
                        {transferringSku === p.sku
                          ? "Enviando..."
                          : `🚚 Enviar ${qtyToMove} pzas: Juárez ➜ Torreón`}
                      </button>
                    );
                  } else if (p.stock_juarez === 0 && p.stock_lerdo >= 2) {
                    const qtyToMove = Math.min(3, p.stock_lerdo);
                    actionElement = (
                      <button
                        disabled={transferringSku === p.sku}
                        onClick={() =>
                          handleExecuteSuggestedTransfer(
                            "lerdo",
                            "juarez",
                            p.sku,
                            qtyToMove
                          )
                        }
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded transition text-[11px]"
                      >
                        {transferringSku === p.sku
                          ? "Enviando..."
                          : `🚚 Enviar ${qtyToMove} pzas: Lerdo ➜ Juárez`}
                      </button>
                    );
                  } else if (p.stock_lerdo === 0 && p.stock_torreon >= 2) {
                    const qtyToMove = Math.min(3, p.stock_torreon);
                    actionElement = (
                      <button
                        disabled={transferringSku === p.sku}
                        onClick={() =>
                          handleExecuteSuggestedTransfer(
                            "torreon",
                            "lerdo",
                            p.sku,
                            qtyToMove
                          )
                        }
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded transition text-[11px]"
                      >
                        {transferringSku === p.sku
                          ? "Enviando..."
                          : `🚚 Enviar ${qtyToMove} pzas: Torreón ➜ Lerdo`}
                      </button>
                    );
                  } else if (p.stock_total_red < 10) {
                    actionElement = (
                      <span className="text-red-600 font-bold">
                        ⚠️ Solicitar a Proveedor
                      </span>
                    );
                  }

                  return (
                    <tr key={p.sku} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-600">
                        {p.sku}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {p.emoji} {p.nombre}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-center font-mono ${
                          p.stock_torreon === 0 ? "text-red-500 font-bold" : ""
                        }`}
                      >
                        {p.stock_torreon}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-center font-mono ${
                          p.stock_juarez === 0 ? "text-red-500 font-bold" : ""
                        }`}
                      >
                        {p.stock_juarez}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-center font-mono ${
                          p.stock_lerdo === 0 ? "text-red-500 font-bold" : ""
                        }`}
                      >
                        {p.stock_lerdo}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-steren">
                        {p.stock_total_red}
                      </td>
                      <td className="py-2.5 px-3 text-center">{actionElement}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VISTA 2: HISTORIAL DE VENTAS */}
      {activeSubTab === "sales" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              🧾 Registro de Ventas por Sucursal
            </h3>
            <p className="text-xs text-slate-500">
              Relación cronológica de tickets emitidos en nuestras tiendas de Torreón,
              Villa Juárez y Lerdo.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Folio</th>
                  <th className="py-2.5 px-3">Sucursal</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Artículos Comprados</th>
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3 text-center">Piezas</th>
                  <th className="py-2.5 px-3 text-right font-bold text-steren">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((s) => (
                  <tr
                    key={`${s.sucursal_codigo}-${s.folio}`}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-steren">
                      {s.folio}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {s.sucursal_nombre}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {s.cliente_nombre}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                      {s.articulos_detalle || `${s.unidades} artículo(s)`}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{s.fecha}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      {s.unidades}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-steren">
                      ${s.total.toFixed(2)} MXN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VISTA 3: DIRECTORIO DE CLIENTES UNIFICADO */}
      {activeSubTab === "customers" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              👥 Directorio Unificado de Clientes Frecuentes
            </h3>
            <p className="text-xs text-slate-500">
              Padrón consolidado de clientes (sin duplicados entre tiendas), mostrando
              todas las sucursales donde han realizado compras y su monto total acumulado.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nombre / Razón Social</th>
                  <th className="py-2.5 px-3">RFC</th>
                  <th className="py-2.5 px-3">Contacto</th>
                  <th className="py-2.5 px-3">Sucursales donde ha comprado</th>
                  <th className="py-2.5 px-3 text-center">Tickets</th>
                  <th className="py-2.5 px-3 text-right font-bold text-steren">
                    Total Acumulado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consolidatedCustomers.map((c) => (
                  <tr key={c.rfc} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{c.nombre}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{c.rfc}</td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {c.email} <span className="text-slate-300">|</span> {c.telefono}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {c.sucursales.map((suc) => (
                          <span
                            key={suc}
                            className="bg-blue-50 text-steren border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          >
                            🏬 {suc.replace("Sucursal ", "")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      {c.total_compras}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-steren">
                      ${c.monto_acumulado.toFixed(2)} MXN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
