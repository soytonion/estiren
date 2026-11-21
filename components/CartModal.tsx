"use client";

import React, { useState } from "react";
import { X, Trash2, UserCheck, CheckCircle2, Printer } from "lucide-react";
import { CartItem, CheckoutInputCustomer, SaleReceipt } from "../lib/types";
import { BranchCode, BRANCHES } from "../lib/branches";
import { AppUser } from "../lib/users";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  activeBranch: BranchCode;
  currentUser: AppUser;
  onUpdateQty: (sku: string, delta: number) => void;
  onRemoveItem: (sku: string) => void;
  onCheckout: (customer: CheckoutInputCustomer) => Promise<SaleReceipt | null>;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  items,
  activeBranch,
  currentUser,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<SaleReceipt | null>(null);

  if (!isOpen) return null;

  const branchInfo = BRANCHES[activeBranch];
  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const subtotal = Number((total / 1.16).toFixed(2));
  const iva = Number((total - subtotal).toFixed(2));

  const handleConfirmCheckout = async () => {
    setIsSubmitting(true);
    try {
      const customerPayload: CheckoutInputCustomer = {
        nombre: currentUser.nombre,
        rfc: currentUser.rfc,
        email: currentUser.email,
        telefono: currentUser.telefono,
      };

      const generatedReceipt = await onCheckout(customerPayload);
      if (generatedReceipt) {
        setReceipt(generatedReceipt);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
        {receipt ? (
          /* VISTA DE COMPROBANTE / TICKET DE COMPRA */
          <div className="flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>¡Gracias por tu compra!</span>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 font-mono text-xs space-y-3">
                <div className="text-center border-b border-dashed border-slate-300 pb-3">
                  <div className="font-black text-base text-steren">
                    ESTIREN ELECTRÓNICA S.A. DE C.V.
                  </div>
                  <div className="text-[11px] text-slate-600 font-sans font-semibold">
                    {receipt.sucursal_nombre}
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">
                    {receipt.sucursal_direccion}
                  </div>
                  <div className="mt-1 inline-block bg-blue-100 text-steren px-2 py-0.5 rounded font-bold text-[11px]">
                    FOLIO: {receipt.folio}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{receipt.fecha}</div>
                </div>

                <div className="border-b border-dashed border-slate-300 pb-2 text-[11px] space-y-0.5">
                  <div>
                    <span className="text-slate-500">Cliente:</span>{" "}
                    <b className="text-slate-800">{receipt.cliente_nombre}</b>
                  </div>
                  <div>
                    <span className="text-slate-500">RFC:</span>{" "}
                    <span className="text-slate-700">{receipt.cliente_rfc}</span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {receipt.items.map((item) => (
                    <div key={item.sku} className="flex justify-between text-[11px]">
                      <span className="truncate max-w-[210px]">
                        {item.cantidad}x {item.nombre}
                      </span>
                      <span className="font-bold">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>${receipt.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IVA (16%):</span>
                    <span>${receipt.iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-steren pt-1 border-t border-slate-200">
                    <span>TOTAL PAGADO:</span>
                    <span>${receipt.total.toFixed(2)} MXN</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
                📦 <b>Listo para entrega:</b> Tu pedido ha sido registrado a nombre de{" "}
                <b>{receipt.cliente_nombre}</b> en <b>{branchInfo.name}</b>. Presenta el
                folio <b>{receipt.folio}</b> en mostrador.
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full bg-steren hover:bg-steren-dark text-white font-bold py-3 rounded-lg text-sm shadow transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Cerrar Ticket</span>
            </button>
          </div>
        ) : (
          /* VISTA DEL CARRITO Y DATOS DEL CLIENTE CONECTADO */
          <>
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>🛒 Tu Carrito</span>
                  <span className="text-xs bg-blue-100 text-steren px-2 py-0.5 rounded-full font-semibold">
                    {branchInfo.name}
                  </span>
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Artículos del carrito */}
              <div className="divide-y divide-slate-100 py-3 space-y-2 max-h-60 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <div className="text-3xl mb-2">🛒</div>
                    Tu carrito está vacío. Agrega productos desde el catálogo.
                  </div>
                ) : (
                  items.map((item) => {
                    const totalItem = item.precio * item.cantidad;
                    return (
                      <div
                        key={item.sku}
                        className="flex items-center justify-between py-2 text-xs gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-2xl select-none">{item.emoji}</span>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {item.nombre}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              ${item.precio}.00 c/u
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center border border-slate-200 rounded">
                            <button
                              onClick={() => onUpdateQty(item.sku, -1)}
                              className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 font-mono font-bold text-slate-800">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => onUpdateQty(item.sku, 1)}
                              className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right min-w-[65px]">
                            <div className="font-bold text-steren">${totalItem}.00</div>
                            <button
                              onClick={() => onRemoveItem(item.sku)}
                              className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5 justify-end ml-auto"
                            >
                              <Trash2 className="w-3 h-3" /> Quitar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Resumen del Cliente con Sesión Iniciada */}
              {items.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-steren" />
                    <span>Cuenta de Cliente Asociada a tu Compra:</span>
                  </span>

                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs space-y-1">
                    <div className="font-bold text-slate-900">{currentUser.nombre}</div>
                    <div className="text-slate-600">
                      RFC: <span className="font-mono font-semibold">{currentUser.rfc}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {currentUser.email} • Tel: {currentUser.telefono}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal (sin IVA):</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>IVA (16%):</span>
                <span className="font-mono">${iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-1">
                <span>Total a Pagar:</span>
                <span className="text-steren font-mono">${total.toFixed(2)} MXN</span>
              </div>
              <button
                disabled={items.length === 0 || isSubmitting}
                onClick={handleConfirmCheckout}
                className="w-full bg-steren hover:bg-steren-dark disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg text-sm shadow transition"
              >
                {isSubmitting
                  ? "Procesando tu compra..."
                  : `Pagar y Registrar en ${branchInfo.name.replace("Sucursal ", "")}`}
              </button>
              <button
                onClick={handleCloseModal}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg text-xs transition"
              >
                Seguir Comprando
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
