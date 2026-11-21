"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "../components/Header";
import { CategoryTabs, ViewType } from "../components/CategoryTabs";
import { ProductCard } from "../components/ProductCard";
import { DetailView } from "../components/DetailView";
import { DashboardView } from "../components/DashboardView";
import { CartModal } from "../components/CartModal";
import { Footer } from "../components/Footer";
import { LoginView } from "../components/LoginView";
import { BranchCode } from "../lib/branches";
import { AppUser, TEST_USERS } from "../lib/users";
import {
  ProductStockInfo,
  FederatedStockRow,
  CartItem,
  CheckoutInputCustomer,
  SaleReceipt,
  CedisBranchMetric,
  CedisGlobalStockRow,
  FederatedSaleRow,
  FederatedCustomerRow,
  NodeHealth,
} from "../lib/types";
import {
  fetchProductsWithStock,
  fetchFederatedStock,
  fetchCedisData,
  executeCheckoutOrder,
  executeStockTransfer,
} from "./actions";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeBranch, setActiveBranch] = useState<BranchCode>("torreon");
  const [currentView, setCurrentView] = useState<ViewType>("store");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Datos de sucursal y productos
  const [products, setProducts] = useState<ProductStockInfo[]>([]);
  const [selectedSku, setSelectedSku] = useState<string>("EST-4020");
  const [federatedRows, setFederatedRows] = useState<FederatedStockRow[]>([]);
  const [isLiveDb, setIsLiveDb] = useState<boolean>(false);

  // Datos de CEDIS Gómez Palacio
  const [cedisMetrics, setCedisMetrics] = useState<CedisBranchMetric[]>([]);
  const [cedisGlobalStock, setCedisGlobalStock] = useState<CedisGlobalStockRow[]>([]);
  const [recentSales, setRecentSales] = useState<FederatedSaleRow[]>([]);
  const [federatedCustomers, setFederatedCustomers] = useState<FederatedCustomerRow[]>(
    []
  );
  const [nodesHealth, setNodesHealth] = useState<NodeHealth[]>([]);

  // Carrito
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Recuperar sesión activa si existe
  useEffect(() => {
    const savedId = window.localStorage.getItem("estiren_user_id");
    if (savedId) {
      const found = TEST_USERS.find((u) => u.id === savedId);
      if (found) {
        setCurrentUser(found);
        setActiveBranch(found.defaultBranch);
        setCurrentView(found.role === "admin" ? "dashboard" : "store");
      }
    }
  }, []);

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    setCart([]);
    setActiveBranch(user.defaultBranch);
    setCurrentView(user.role === "admin" ? "dashboard" : "store");
    window.localStorage.setItem("estiren_user_id", user.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setIsCartOpen(false);
    window.localStorage.removeItem("estiren_user_id");
  };

  const refreshAllData = useCallback(async () => {
    const [prodRes, fedRes, cedisRes] = await Promise.all([
      fetchProductsWithStock(activeBranch),
      fetchFederatedStock(selectedSku, activeBranch),
      fetchCedisData(),
    ]);

    setProducts(prodRes.products);
    setIsLiveDb(prodRes.isLiveDb);
    setFederatedRows(fedRes.rows);
    setCedisMetrics(cedisRes.metrics);
    setCedisGlobalStock(cedisRes.globalStock);
    setRecentSales(cedisRes.recentSales);
    setFederatedCustomers(cedisRes.federatedCustomers);
    setNodesHealth(cedisRes.nodesHealth);

    // Ajustar el carrito si algún producto supera el stock disponible en la sucursal seleccionada
    setCart((prev) =>
      prev
        .map((item) => {
          const p = prodRes.products.find((prod) => prod.sku === item.sku);
          const maxStock = p?.stock_local ?? 0;
          return {
            ...item,
            cantidad: Math.min(item.cantidad, maxStock),
          };
        })
        .filter((item) => item.cantidad > 0)
    );
  }, [activeBranch, selectedSku]);

  useEffect(() => {
    if (currentUser) {
      refreshAllData();
    }
  }, [currentUser, refreshAllData]);

  // Manejo de Carrito con validación de existencias locales
  const handleAddToCart = (sku: string, qty: number = 1) => {
    const prod = products.find((p) => p.sku === sku);
    if (!prod || prod.stock_local <= 0) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.sku === sku);
      if (existing) {
        const nextQty = Math.min(prod.stock_local, existing.cantidad + qty);
        return prev.map((i) =>
          i.sku === sku ? { ...i, cantidad: nextQty } : i
        );
      }
      return [
        ...prev,
        {
          sku: prod.sku,
          nombre: prod.nombre,
          precio: prod.precio,
          emoji: prod.emoji,
          cantidad: Math.min(prod.stock_local, qty),
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (sku: string, delta: number) => {
    const prod = products.find((p) => p.sku === sku);
    const maxStock = prod?.stock_local ?? 99;

    setCart((prev) =>
      prev
        .map((item) =>
          item.sku === sku
            ? {
                ...item,
                cantidad: Math.min(maxStock, Math.max(0, item.cantidad + delta)),
              }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const handleRemoveFromCart = (sku: string) => {
    setCart((prev) => prev.filter((i) => i.sku !== sku));
  };

  const handleCheckout = async (
    customer: CheckoutInputCustomer
  ): Promise<SaleReceipt | null> => {
    if (cart.length === 0) return null;

    const result = await executeCheckoutOrder(activeBranch, cart, customer);
    if (result.success && result.receipt) {
      setCart([]);
      await refreshAllData();
      return result.receipt;
    } else {
      alert(result.message || "No se pudo completar la compra.");
      await refreshAllData();
      return null;
    }
  };

  const handleTransferStock = async (
    fromBranch: BranchCode,
    toBranch: BranchCode,
    sku: string,
    cantidad: number
  ) => {
    const res = await executeStockTransfer(fromBranch, toBranch, sku, cantidad);
    await refreshAllData();
    return { success: res.success, message: res.message };
  };

  // Si no ha iniciado sesión, mostrar la pantalla de Login
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === "admin";

  // Filtrado de productos para la Tienda
  const filteredProducts = products.filter((p) => {
    const matchCat =
      selectedCategory === "all" || p.categoria_slug === selectedCategory;
    const matchSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    let matchStock = true;
    if (stockFilter === "local") matchStock = p.stock_local > 0;
    if (stockFilter === "federated")
      matchStock = p.stock_local === 0 && p.total_otras > 0;

    return matchCat && matchSearch && matchStock;
  });

  const selectedProduct =
    products.find((p) => p.sku === selectedSku) || products[0];

  return (
    <>
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        activeBranch={activeBranch}
        onBranchChange={(b) => setActiveBranch(b)}
        cartCount={cart.reduce((sum, i) => sum + i.cantidad, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onGoHome={() => setCurrentView(isAdmin ? "dashboard" : "store")}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <CategoryTabs
        currentUser={currentUser}
        currentView={isAdmin ? "dashboard" : currentView}
        onViewChange={(view) => {
          if (!isAdmin && view !== "dashboard") {
            setCurrentView(view);
          }
        }}
        activeBranch={activeBranch}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {isAdmin ? (
          /* ROL ADMINISTRADOR: ACCESO EXCLUSIVO AL PANEL DE CONTROL Y OPERACIONES */
          <DashboardView
            metrics={cedisMetrics}
            globalStock={cedisGlobalStock}
            recentSales={recentSales}
            federatedCustomers={federatedCustomers}
            nodesHealth={nodesHealth}
            isLiveDb={isLiveDb}
            onRefresh={refreshAllData}
            onQuickTransfer={async (from, to, sku, qty) => {
              await handleTransferStock(from, to, sku, qty);
            }}
          />
        ) : (
          /* ROL CLIENTE: ACCESO A TIENDA EN LÍNEA Y DETALLE DE PRODUCTO */
          <>
            {currentView === "store" && (
              <div className="space-y-6">
                {/* Hero Banner */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #002b4d 0%, #005a9c 50%, #0077c8 100%)",
                  }}
                  className="relative rounded-2xl overflow-hidden shadow-md text-white p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6"
                >
                  <div className="space-y-3 z-10 max-w-xl">
                    <span className="bg-sky-300 text-slate-900 font-black px-2.5 py-1 rounded text-xs uppercase tracking-wider inline-block">
                      ¡Hola, {currentUser.nombre.split(" ")[0]}! • Semana del Soldador
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                      Gran Venta de Componentes, Cautines y Chácharas
                    </h1>
                    <p className="text-sky-100 text-sm">
                      Descubre cables para puertos que tu computadora ya no tiene,
                      adaptadores milagrosos y herramientas disponibles para entrega
                      inmediata en todas nuestras sucursales de la Laguna.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setSelectedCategory("cables")}
                        className="bg-white text-steren hover:bg-slate-100 font-bold px-4 py-2 rounded-lg text-sm shadow transition"
                      >
                        Ver Ofertas Locas
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSku("EST-4020");
                          setCurrentView("product");
                        }}
                        className="bg-slate-900/40 hover:bg-slate-900/60 border border-white/30 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
                      >
                        Ver Producto Destacado
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-900/35 backdrop-blur-md p-5 rounded-xl border border-white/20 text-center shrink-0 w-full sm:w-auto">
                    <div className="text-3xl font-black text-sky-300">HASTA 60%</div>
                    <div className="text-xs uppercase font-semibold text-white">
                      De descuento en cables sin usar
                    </div>
                    <div className="mt-2 text-[11px] bg-slate-900/60 px-3 py-1 rounded-full text-sky-100">
                      Válido en Torreón, Villa Juárez y Lerdo
                    </div>
                  </div>
                </div>

                {/* Filtros de Categoría y Stock */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Categoría:
                    </span>
                    {[
                      { slug: "all", label: "Todos" },
                      { slug: "cables", label: "Cables Imposibles" },
                      { slug: "herramientas", label: "Herramientas" },
                      { slug: "energia", label: "Energía y Pilas" },
                      { slug: "arduino", label: "Módulos & Proyectos" },
                    ].map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                          selectedCategory === cat.slug
                            ? "bg-steren text-white shadow-sm"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Filtro por disponibilidad */}
                  <div className="flex items-center gap-2 text-xs w-full md:w-auto justify-end">
                    <span className="text-slate-500 font-medium">Disponibilidad:</span>
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="border border-slate-300 rounded px-2.5 py-1 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="all">Ver todo el catálogo</option>
                      <option value="local">Con entrega hoy en mi sucursal</option>
                      <option value="federated">
                        Disponibles en otras sucursales cercanas
                      </option>
                    </select>
                  </div>
                </div>

                {/* Grid de Productos */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white p-12 rounded-xl text-center border border-slate-200">
                    <div className="text-4xl mb-2">🤷‍♂️</div>
                    <h3 className="font-bold text-slate-800">
                      No encontramos productos con esos filtros
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Prueba cambiando la categoría o seleccionando otra sucursal cercana.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredProducts.map((p) => (
                      <ProductCard
                        key={p.sku}
                        product={p}
                        activeBranch={activeBranch}
                        onSelectProduct={(sku) => {
                          setSelectedSku(sku);
                          setCurrentView("product");
                        }}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentView === "product" && selectedProduct && (
              <DetailView
                product={selectedProduct}
                activeBranch={activeBranch}
                federatedRows={federatedRows}
                onBackToStore={() => setCurrentView("store")}
                onAddToCart={handleAddToCart}
                onSelectBranch={(b) => setActiveBranch(b)}
              />
            )}
          </>
        )}
      </main>

      {!isAdmin && (
        <CartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          activeBranch={activeBranch}
          currentUser={currentUser}
          onUpdateQty={handleUpdateCartQty}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
      )}

      <Footer />
    </>
  );
}
