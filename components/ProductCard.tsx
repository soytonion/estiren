"use client";

import React from "react";
import { ProductStockInfo } from "../lib/types";
import { BranchCode, BRANCHES } from "../lib/branches";
import { ProductPhotoRender } from "./ProductVisuals";

interface ProductCardProps {
  product: ProductStockInfo;
  activeBranch: BranchCode;
  onSelectProduct: (sku: string) => void;
  onAddToCart: (sku: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  activeBranch,
  onSelectProduct,
  onAddToCart,
}) => {
  const isLocalAvailable = product.stock_local > 0;
  const currentBranchName = BRANCHES[activeBranch].name.replace("Sucursal ", "");

  const otherBranches: BranchCode[] = (["torreon", "juarez", "lerdo"] as BranchCode[]).filter(
    (b) => b !== activeBranch
  );

  const otherStockSummary = otherBranches
    .map((b) => `${BRANCHES[b].name.replace("Sucursal ", "")}: ${product.stock_otras[b] || 0}`)
    .join(" | ");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between overflow-hidden group">
      <div className="p-4">
        {/* Badges superiores */}
        <div className="flex items-center justify-between text-[11px] mb-2">
          <span className="font-mono font-bold text-slate-400">{product.sku}</span>
          {isLocalAvailable ? (
            <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              En {currentBranchName}: {product.stock_local}
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Agotado en {currentBranchName}
            </span>
          )}
        </div>

        {/* Fotografía de Estudio del Producto */}
        <div
          className="h-44 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center p-2 group-hover:scale-[1.03] transition cursor-pointer select-none overflow-hidden"
          onClick={() => onSelectProduct(product.sku)}
        >
          <ProductPhotoRender sku={product.sku} angle="front" />
        </div>

        {/* Info */}
        <h3
          className="font-bold text-sm text-slate-900 mt-3 group-hover:text-steren transition cursor-pointer line-clamp-2"
          onClick={() => onSelectProduct(product.sku)}
        >
          {product.nombre}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.descripcion}</p>
      </div>

      {/* Pie de tarjeta */}
      <div className="p-4 pt-0">
        {/* Disponibilidad en otras sucursales */}
        <div className="bg-slate-50 border border-slate-200 rounded p-2 mb-3 text-[11px]">
          <div className="flex items-center justify-between text-slate-600 font-semibold">
            <span className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  product.total_otras > 0 ? "bg-blue-500" : "bg-slate-300"
                }`}
              ></span>
              En otras sucursales:
            </span>
            <span className="font-mono text-slate-800 font-bold">
              {product.total_otras} pzas
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            {otherStockSummary}
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-lg font-black text-steren">${product.precio}.00</span>
            <span className="text-xs text-slate-400 line-through ml-1">
              ${product.precio_original}.00
            </span>
          </div>
          <span className="text-[10px] text-slate-400">IVA incl.</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelectProduct(product.sku)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded transition"
          >
            Ver sucursales
          </button>
          <button
            disabled={!isLocalAvailable}
            onClick={() => onAddToCart(product.sku)}
            className="bg-steren hover:bg-steren-dark disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded transition shadow-sm"
          >
            {isLocalAvailable ? "+ Agregar" : "Agotado aquí"}
          </button>
        </div>
      </div>
    </div>
  );
};
