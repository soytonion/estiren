"use client";

import React from "react";
import { ShoppingBag, PackageSearch, Building2, MapPin } from "lucide-react";
import { BranchCode, BRANCHES } from "../lib/branches";
import { AppUser } from "../lib/users";

export type ViewType = "store" | "product" | "dashboard";

interface CategoryTabsProps {
  currentUser: AppUser;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  activeBranch: BranchCode;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  currentUser,
  currentView,
  onViewChange,
  activeBranch,
}) => {
  const branchInfo = BRANCHES[activeBranch];
  const isAdmin = currentUser.role === "admin";

  return (
    <div className="bg-steren text-white px-4 py-2 text-xs shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4">
        {isAdmin ? (
          <div className="flex items-center gap-2 py-0.5">
            <Building2 className="w-4 h-4 text-sky-300" />
            <span className="font-bold text-white">
              Panel de Control y Operaciones — CEDIS Gómez Palacio
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onViewChange("store")}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                currentView === "store"
                  ? "bg-white text-steren font-bold shadow-sm"
                  : "bg-steren-dark hover:bg-steren-800 text-white font-medium"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Catálogo de Productos</span>
            </button>

            <button
              onClick={() => onViewChange("product")}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                currentView === "product"
                  ? "bg-white text-steren font-bold shadow-sm"
                  : "bg-steren-dark hover:bg-steren-800 text-white font-medium"
              }`}
            >
              <PackageSearch className="w-3.5 h-3.5" />
              <span>Detalle de Producto</span>
            </button>
          </div>
        )}

        {/* Dirección de la sucursal seleccionada o información del usuario */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-sky-100">
          <MapPin className="w-3.5 h-3.5 text-sky-300" />
          {isAdmin ? (
            <span>Centro de Distribución Regional • Gómez Palacio, Dgo.</span>
          ) : (
            <span>
              Tienda seleccionada: <b className="text-white">{branchInfo.name}</b> (
              {branchInfo.address})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
