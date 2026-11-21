"use client";

import React, { useState } from "react";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { AppUser, TEST_USERS } from "../lib/users";

interface LoginViewProps {
  onLogin: (user: AppUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = TEST_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password.trim()
    );

    if (!found) {
      setError("Correo electrónico o contraseña incorrectos.");
      return;
    }

    setError(null);
    onLogin(found);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Barra superior blanca integrada con el logo */}
      <div className="bg-white border-b-4 border-steren py-4 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/EstirenLogo.png"
              alt="Logo Estiren"
              className="h-11 w-11 object-contain"
            />
            <div className="leading-tight">
              <div className="text-steren font-black text-2xl italic tracking-tight">
                Estiren<span className="text-sky-400">.</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Electrónica &amp; Chácharas • Comarca Lagunera
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            📞 Atención a Clientes: 800-ESTIREN
          </span>
        </div>
      </div>

      {/* Formulario de Inicio de Sesión Centrado */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <div className="flex justify-center mb-2">
              <img
                src="/EstirenLogo.png"
                alt="Logo Estiren"
                className="h-14 w-14 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h1>
            <p className="text-xs text-slate-500">
              Ingresa tu correo electrónico y contraseña para acceder a tu cuenta.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.mx"
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-steren transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-steren transition"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-steren hover:bg-steren-dark text-white font-bold py-3 rounded-lg text-sm shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>Entrar a mi Cuenta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Pie simple */}
      <div className="bg-steren-900 text-sky-100 py-3 text-center text-xs border-t border-steren-800">
        © 2026 Estiren &amp; Aflojen Electronics S.A. de C.V. • Comarca Lagunera
      </div>
    </div>
  );
};
