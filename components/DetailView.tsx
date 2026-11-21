"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Store, MapPin } from "lucide-react";
import { ProductStockInfo, FederatedStockRow } from "../lib/types";
import { BranchCode, BRANCHES } from "../lib/branches";
import {
  ProductPhotoRender,
  PRODUCT_PHOTOS_META,
  PhotoAngle,
} from "./ProductVisuals";

interface DetailViewProps {
  product: ProductStockInfo;
  activeBranch: BranchCode;
  federatedRows: FederatedStockRow[];
  onBackToStore: () => void;
  onAddToCart: (sku: string, qty: number) => void;
  onSelectBranch: (branch: BranchCode) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  product,
  activeBranch,
  federatedRows,
  onBackToStore,
  onAddToCart,
  onSelectBranch,
}) => {
  const [qty, setQty] = useState(1);
  const [activeAngle, setActiveAngle] = useState<PhotoAngle>("front");

  // Al cambiar de producto, volver a la primera foto de la galería
  useEffect(() => {
    setActiveAngle("front");
    setQty(1);
  }, [product.sku]);

  const currentPhotoIndex = PRODUCT_PHOTOS_META.findIndex(
    (p) => p.angle === activeAngle
  );
  const currentPhotoMeta =
    PRODUCT_PHOTOS_META[currentPhotoIndex] || PRODUCT_PHOTOS_META[0];

  return (
    <div className="space-y-6">
      {/* Migas de pan */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={onBackToStore}
          className="text-steren hover:underline flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Catálogo</span>
        </button>
        <span>/</span>
        <span className="text-slate-400 capitalize">{product.categoria_slug}</span>
        <span>/</span>
        <span className="text-slate-700 font-bold">{product.sku}</span>
      </div>

      {/* Tarjeta principal de producto */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* GALERÍA DE FOTOS ESTILO MERCADO LIBRE */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-xl">
          {/* Visor Principal de la Fotografía Seleccionada */}
          <div className="relative w-full aspect-square max-w-[310px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center group">
            <span className="absolute top-3 left-3 z-10 bg-slate-900/75 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {currentPhotoIndex + 1} / {PRODUCT_PHOTOS_META.length}
            </span>
            <span className="absolute top-3 right-3 z-10 bg-blue-50 text-steren border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">
              {currentPhotoMeta.label}
            </span>

            <div className="w-full h-full p-2 transition-transform duration-300 group-hover:scale-105">
              <ProductPhotoRender sku={product.sku} angle={activeAngle} />
            </div>

            <div className="absolute bottom-2 inset-x-3 text-center">
              <span className="inline-block bg-white/90 backdrop-blur-sm text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full border border-slate-200 shadow-sm">
                {currentPhotoMeta.caption}
              </span>
            </div>
          </div>

          {/* Tira de Miniaturas Interactivas (Hover o Clic como en Mercado Libre) */}
          <div className="mt-4 grid grid-cols-4 gap-2.5 w-full max-w-[310px]">
            {PRODUCT_PHOTOS_META.map((meta) => {
              const isSelected = activeAngle === meta.angle;
              return (
                <button
                  key={meta.angle}
                  type="button"
                  onClick={() => setActiveAngle(meta.angle)}
                  onMouseEnter={() => setActiveAngle(meta.angle)}
                  className={`flex flex-col items-center p-1 rounded-lg bg-white transition cursor-pointer overflow-hidden ${
                    isSelected
                      ? "border-2 border-steren ring-2 ring-steren/20 shadow-sm"
                      : "border border-slate-300 hover:border-slate-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="w-full aspect-square rounded overflow-hidden">
                    <ProductPhotoRender sku={product.sku} angle={meta.angle} />
                  </div>
                  <span
                    className={`text-[9px] font-bold mt-1 truncate w-full text-center ${
                      isSelected ? "text-steren" : "text-slate-500"
                    }`}
                  >
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-steren" />
            <span>
              Ubicación en {BRANCHES[activeBranch].name.replace("Sucursal ", "")}:{" "}
              <b>
                {product.pasillo || "Pasillo 1"} - {product.estante || "Estante A"}
              </b>
            </span>
          </div>
          <span className="mt-2 text-[11px] text-slate-400 italic">
            Garantía Estiren: Si saca chispas es que funciona
          </span>
        </div>

        {/* Información y Precio */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                MODELO: {product.sku}
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                Artículo de Línea
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">{product.nombre}</h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {product.descripcion}
            </p>
          </div>

          {/* Precios */}
          <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl flex items-baseline gap-4">
            <span className="text-3xl font-black text-steren">${product.precio}.00 MXN</span>
            <span className="text-sm text-slate-400 line-through">
              ${product.precio_original}.00 MXN
            </span>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
              -
              {Math.round(
                ((product.precio_original - product.precio) / product.precio_original) * 100
              )}
              %
            </span>
            <span className="text-xs text-slate-500 ml-auto font-medium">IVA incluido</span>
          </div>

          {/* Disponibilidad en Tiendas Estiren */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-steren" />
                <h3 className="font-bold text-sm text-slate-900">
                  Disponibilidad en Tiendas Estiren
                </h3>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Existencias al momento
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Consulta en qué sucursal de la Comarca Lagunera puedes recoger este producto
              hoy mismo:
            </p>

            <div className="space-y-2">
              {federatedRows.map((row) => {
                const branchMeta = BRANCHES[row.sucursal_codigo];
                return (
                  <div
                    key={row.sucursal_codigo}
                    className={`p-3 rounded-lg flex items-center justify-between text-xs border ${
                      row.es_local
                        ? "bg-blue-50/90 border-steren"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{row.es_local ? "📍" : "🏬"}</span>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                          <span>{row.sucursal_nombre}</span>
                          {row.es_local ? (
                            <span className="bg-steren text-white text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase">
                              Tu sucursal seleccionada
                            </span>
                          ) : (
                            row.stock > 0 && (
                              <button
                                onClick={() => onSelectBranch(row.sucursal_codigo)}
                                className="text-[10px] text-steren hover:underline font-semibold"
                              >
                                Cambiar a esta sucursal →
                              </button>
                            )
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {branchMeta?.address} • Tel: {branchMeta?.phone}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          row.stock > 0
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {row.stock > 0 ? `${row.stock} disponibles` : "Agotado"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botones de compra */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
              <button
                disabled={product.stock_local <= 0}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold"
              >
                -
              </button>
              <span className="px-4 py-2 text-sm font-bold bg-white text-slate-900">
                {product.stock_local > 0 ? Math.min(qty, product.stock_local) : 0}
              </span>
              <button
                disabled={product.stock_local <= 0 || qty >= product.stock_local}
                onClick={() =>
                  setQty((q) => Math.min(product.stock_local, q + 1))
                }
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold"
              >
                +
              </button>
            </div>
            <button
              disabled={product.stock_local <= 0}
              onClick={() =>
                onAddToCart(product.sku, Math.min(qty, product.stock_local))
              }
              className="flex-1 bg-steren hover:bg-steren-dark disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg shadow-md transition flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>
                {product.stock_local > 0
                  ? `Agregar al Carrito (${BRANCHES[activeBranch].name.replace("Sucursal ", "")})`
                  : `Agotado en ${BRANCHES[activeBranch].name.replace("Sucursal ", "")} (Elige otra sucursal arriba)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
