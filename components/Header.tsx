"use client";

import React from "react";
import {
  Search,
  ShoppingCart,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { BranchCode } from "../lib/branches";
import { AppUser } from "../lib/users";

interface HeaderProps {
  currentUser: AppUser;
  onLogout: () => void;
  activeBranch: BranchCode;
  onBranchChange: (branch: BranchCode) => void;
  cartCount: number;
  onOpenCart: () => void;
  onGoHome: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  activeBranch,
  onBranchChange,
  cartCount,
  onOpenCart,
  onGoHome,
  searchTerm,
  onSearchChange,
}) => {
  const isAdmin = currentUser.role === "admin";

  return (
    <header className="w-full select-none">
      {/* Barra superior en Azul Profundo Estiren */}
      <div className="bg-steren-900 text-slate-100 text-xs py-1.5 px-4 flex justify-between items-center border-b border-steren-800">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {isAdmin ? (
            <>
              <span className="bg-sky-400 text-steren-900 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                Corporativo
              </span>
              <span className="text-sky-100">
                🏢 Portal de Administración y Operaciones Regionales • Comarca Lagunera
              </span>
            </>
          ) : (
            <>
              <span className="bg-sky-400 text-steren-900 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                Envío Gratis
              </span>
              <span className="hidden sm:inline text-slate-200">
                En compras mayores a $599 a toda la Comarca Lagunera
              </span>
              <span className="text-sky-300 font-medium hidden md:inline">
                • Hasta 12 meses sin intereses en tienda y en línea
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-sky-100">
          <span className="flex items-center gap-1 hover:text-white transition">
            <Phone className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Atención a Clientes:</span> 800-ESTIREN
          </span>
          {!isAdmin && (
            <span className="flex items-center gap-1 hover:text-white transition hidden lg:flex">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Garantía directa en sucursal
            </span>
          )}
        </div>
      </div>

      {/* Header Principal Blanco Limpio — Integración natural del logo sin recuadros */}
      <div className="bg-white text-slate-800 px-4 py-3.5 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo Estiren (Sin cuadro de fondo, integrado directamente) */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={onGoHome}
            >
              <img
                src="/EstirenLogo.png"
                alt="Logo Estiren"
                className="h-11 w-11 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="flex flex-col leading-tight">
                <div className="text-steren font-black text-2xl tracking-tight italic flex items-center gap-0.5">
                  Estiren<span className="text-sky-400 text-3xl leading-none">.</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  {isAdmin ? "Operaciones & CEDIS" : "Electrónica & Chácharas"}
                </span>
                <span className="text-[9px] text-slate-400 italic">
                  &quot;Si no lo tenemos, te lo inventamos&quot;
                </span>
              </div>
            </div>
          </div>

          {/* Barra de búsqueda (Solo para Clientes) */}
          {!isAdmin ? (
            <div className="w-full md:max-w-md lg:max-w-lg flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar cautín, adaptador VGA a HDMI, batería 9V, multímetro..."
                  className="w-full py-2 pl-4 pr-10 text-sm text-slate-800 bg-slate-50 border border-r-0 border-slate-300 rounded-l-lg focus:outline-none focus:bg-white focus:border-steren placeholder-slate-400 transition"
                />
                <div className="absolute right-3 top-2.5 text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>
              <button className="bg-steren hover:bg-steren-dark text-white font-bold px-5 py-2 border border-steren rounded-r-lg text-sm transition shrink-0">
                Buscar
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 bg-steren-50 border border-steren-200 px-4 py-2 rounded-lg text-xs text-steren-dark font-medium">
              <Shield className="w-4 h-4 text-steren" />
              <span>
                Modo Administrador Activo • Acceso exclusivo a Panel de Control y
                Operaciones
              </span>
            </div>
          )}

          {/* Controles de Sucursal, Usuario y Carrito */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
            {/* Selector de Sucursal (Solo para Clientes) */}
            {!isAdmin && (
              <div className="bg-steren-50 border border-steren-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-steren" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-steren-dark font-bold uppercase leading-none">
                    Sucursal:
                  </span>
                  <select
                    value={activeBranch}
                    onChange={(e) => onBranchChange(e.target.value as BranchCode)}
                    className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="torreon" className="text-slate-900">
                      Sucursal Torreón
                    </option>
                    <option value="juarez" className="text-slate-900">
                      Sucursal Villa Juárez
                    </option>
                    <option value="lerdo" className="text-slate-900">
                      Sucursal Lerdo
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* Información de Usuario Conectado */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
              <User className="w-4 h-4 text-steren shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-slate-400 uppercase font-bold">
                  {isAdmin ? "Administrador:" : "Cliente:"}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                  {currentUser.nombre.replace(" (Administrador)", "")}
                </span>
              </div>
            </div>

            {/* Botón Carrito (Solo para Clientes) */}
            {!isAdmin && (
              <button
                onClick={onOpenCart}
                className="relative bg-steren hover:bg-steren-dark text-white px-3 py-2 rounded-lg flex items-center gap-2 transition text-xs font-bold shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden lg:inline">Carrito</span>
                <span className="bg-white text-steren font-black rounded-full px-1.5 py-0.2 text-[11px]">
                  {cartCount}
                </span>
              </button>
            )}

            {/* Botón Cerrar Sesión / Cambiar Usuario */}
            <button
              onClick={onLogout}
              title="Cambiar de cuenta o cerrar sesión"
              className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-2.5 py-2 rounded-lg flex items-center gap-1 text-xs font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
